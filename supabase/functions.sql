-- ==============================================================================
-- NOCHELIS E-COMMERCE - SUPABASE RPC FUNCTIONS (Compras, Vendas e Estoque)
-- ==============================================================================

-- 1. FUNÇÃO: PROCESSAR ENTRADA DE ORDEM DE COMPRA NO ESTOQUE
CREATE OR REPLACE FUNCTION public.receive_purchase_order(
    p_order_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_total_amount NUMERIC(12,2) := 0.00;
BEGIN
    -- Busca a ordem de compra
    SELECT * INTO v_order FROM public.purchase_orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ordem de compra não encontrada (ID: %)', p_order_id;
    END IF;

    IF v_order.status = 'received' THEN
        RAISE EXCEPTION 'Esta ordem de compra já foi recebida anteriormente.';
    END IF;

    -- Processa cada item da ordem de compra
    FOR v_item IN SELECT * FROM public.purchase_order_items WHERE purchase_order_id = p_order_id LOOP
        -- 1. Atualiza ou insere saldo no inventário do destino
        INSERT INTO public.product_inventory (product_id, stock_location_id, quantity)
        VALUES (v_item.product_id, v_order.destination_location_id, v_item.quantity)
        ON CONFLICT (product_id, stock_location_id)
        DO UPDATE SET 
            quantity = public.product_inventory.quantity + EXCLUDED.quantity,
            updated_at = timezone('utc'::text, now());

        -- 2. Atualiza o preço de custo do produto principal
        UPDATE public.products
        SET cost_price = v_item.unit_cost_price,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item.product_id;

        -- 3. Registra movimentação de auditoria
        INSERT INTO public.inventory_movements (
            product_id,
            movement_type,
            quantity,
            target_location_id,
            reference_id,
            reference_type,
            unit_cost,
            notes,
            created_by
        ) VALUES (
            v_item.product_id,
            'purchase_entry',
            v_item.quantity,
            v_order.destination_location_id,
            p_order_id,
            'purchase_order',
            v_item.unit_cost_price,
            'Entrada por Ordem de Compra #' || v_order.order_number,
            p_user_id
        );

        v_total_amount := v_total_amount + v_item.subtotal;
    END LOOP;

    -- 4. Atualiza status da ordem de compra para recebido
    UPDATE public.purchase_orders
    SET status = 'received',
        received_at = timezone('utc'::text, now()),
        total_amount = v_total_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', 'received',
        'total_amount', v_total_amount
    );
END;
$$;

-- 2. FUNÇÃO: FINALIZAR PEDIDO DE VENDA E BAIXAR ESTOQUE DO CANAL
CREATE OR REPLACE FUNCTION public.process_sales_order(
    p_order_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_current_stock INT;
    v_prod_cost NUMERIC(12,2);
    v_total_cost NUMERIC(12,2) := 0.00;
    v_subtotal NUMERIC(12,2) := 0.00;
    v_gross_profit NUMERIC(12,2) := 0.00;
BEGIN
    SELECT * INTO v_order FROM public.sales_orders WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido de venda não encontrado (ID: %)', p_order_id;
    END IF;

    IF v_order.status IN ('paid', 'shipped', 'delivered') THEN
        RAISE EXCEPTION 'Este pedido já foi faturado/processado.';
    END IF;

    -- Itera itens da venda
    FOR v_item IN SELECT * FROM public.sales_order_items WHERE sales_order_id = p_order_id LOOP
        -- Busca custo atual do produto se ainda não gravado
        SELECT cost_price INTO v_prod_cost FROM public.products WHERE id = v_item.product_id;
        IF v_prod_cost IS NULL THEN v_prod_cost := 0.00; END IF;

        -- Abate do estoque do canal específico
        UPDATE public.product_inventory
        SET quantity = quantity - v_item.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE product_id = v_item.product_id AND stock_location_id = v_order.stock_location_id;

        -- Se não existia linha de estoque, cria negativa para alertar ajuste
        IF NOT FOUND THEN
            INSERT INTO public.product_inventory (product_id, stock_location_id, quantity)
            VALUES (v_item.product_id, v_order.stock_location_id, -v_item.quantity);
        END IF;

        -- Congela o custo unitário e lucro no item da venda
        UPDATE public.sales_order_items
        SET unit_cost_price = v_prod_cost,
            profit = (v_item.unit_sale_price - v_prod_cost) * v_item.quantity
        WHERE id = v_item.id;

        -- Registra movimentação de auditoria
        INSERT INTO public.inventory_movements (
            product_id,
            movement_type,
            quantity,
            source_location_id,
            reference_id,
            reference_type,
            unit_cost,
            notes,
            created_by
        ) VALUES (
            v_item.product_id,
            'sale_exit',
            v_item.quantity,
            v_order.stock_location_id,
            p_order_id,
            'sales_order',
            v_prod_cost,
            'Saída por Venda #' || v_order.order_number,
            p_user_id
        );

        v_total_cost := v_total_cost + (v_prod_cost * v_item.quantity);
        v_subtotal := v_subtotal + v_item.subtotal;
    END LOOP;

    v_gross_profit := (v_subtotal - v_order.discount) - v_total_cost;

    -- Atualiza pedido com status pago, CMV total e lucro bruto
    UPDATE public.sales_orders
    SET status = 'paid',
        subtotal = v_subtotal,
        total_cost = v_total_cost,
        gross_profit = v_gross_profit,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', 'paid',
        'total_cost', v_total_cost,
        'gross_profit', v_gross_profit
    );
END;
$$;
