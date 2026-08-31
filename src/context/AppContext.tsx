'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Category,
  ChannelType,
  Customer,
  Product,
  ProductInventory,
  PurchaseOrder,
  PurchaseOrderItem,
  SalesOrder,
  SalesOrderItem,
  StockLocation,
  Supplier,
} from '@/types';
import {
  initialCategories,
  initialChannelTypes,
  initialCustomers,
  initialProducts,
  initialPurchaseOrders,
  initialSalesOrders,
  initialStockLocations,
  initialSuppliers,
} from '@/lib/mockData';

interface AppContextType {
  stockLocations: StockLocation[];
  channelTypes: ChannelType[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  
  // Ações de Produtos
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>, initialStocks?: { location_id: string; quantity: number }[]) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Ações de Estoque & Locais
  addStockLocation: (location: Omit<StockLocation, 'id' | 'created_at' | 'updated_at'>) => Promise<StockLocation>;
  updateStockLocation: (id: string, updates: Partial<StockLocation>) => Promise<void>;
  deleteStockLocation: (id: string) => Promise<void>;
  updateStockQuantity: (productId: string, locationId: string, quantity: number) => Promise<void>;
  transferStock: (productId: string, fromLocationId: string, toLocationId: string, quantity: number) => Promise<void>;
  
  // Ações de Tipos de Canal
  addChannelType: (channelType: Omit<ChannelType, 'id' | 'created_at'>) => Promise<ChannelType>;
  updateChannelType: (id: string, updates: Partial<ChannelType>) => Promise<void>;
  deleteChannelType: (id: string) => Promise<void>;

  // Ações de Categorias
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Ações de Clientes e Fornecedores
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Ações de Compras e Vendas
  createPurchaseOrder: (
    data: Omit<PurchaseOrder, 'id' | 'order_number' | 'status' | 'total_amount' | 'created_at' | 'updated_at'>,
    items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'subtotal'>[]
  ) => Promise<PurchaseOrder>;
  
  createSalesOrder: (
    data: Omit<SalesOrder, 'id' | 'order_number' | 'status' | 'subtotal' | 'total_amount' | 'total_cost' | 'gross_profit' | 'created_at' | 'updated_at'>,
    items: Omit<SalesOrderItem, 'id' | 'sales_order_id' | 'subtotal' | 'profit' | 'unit_cost_price'>[]
  ) => Promise<SalesOrder>;

  // Métricas agregadas
  metrics: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    totalProductsCount: number;
    totalUnitsInStock: number;
    lowStockCount: number;
    channelMetrics: {
      locationId: string;
      locationName: string;
      channelType: string;
      totalSales: number;
      revenue: number;
      profit: number;
      stockUnits: number;
    }[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STOCK_LOCATIONS: 'nochelis_stock_locations_v3',
  CHANNEL_TYPES: 'nochelis_channel_types_v3',
  CATEGORIES: 'nochelis_categories_v3',
  SUPPLIERS: 'nochelis_suppliers_v3',
  CUSTOMERS: 'nochelis_customers_v3',
  PRODUCTS: 'nochelis_products_v3',
  PURCHASE_ORDERS: 'nochelis_purchases_v3',
  SALES_ORDERS: 'nochelis_sales_v3',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Inicialização com LocalStorage ou Mock inicial
  useEffect(() => {
    try {
      const storedLocations = localStorage.getItem(STORAGE_KEYS.STOCK_LOCATIONS);
      const storedChannelTypes = localStorage.getItem(STORAGE_KEYS.CHANNEL_TYPES);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedPurchases = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      const storedSales = localStorage.getItem(STORAGE_KEYS.SALES_ORDERS);

      setStockLocations(storedLocations ? JSON.parse(storedLocations) : initialStockLocations);
      setChannelTypes(storedChannelTypes ? JSON.parse(storedChannelTypes) : initialChannelTypes);
      setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
      setSuppliers(storedSuppliers ? JSON.parse(storedSuppliers) : initialSuppliers);
      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : initialCustomers);
      setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
      setPurchaseOrders(storedPurchases ? JSON.parse(storedPurchases) : initialPurchaseOrders);
      setSalesOrders(storedSales ? JSON.parse(storedSales) : initialSalesOrders);
    } catch (e) {
      console.warn('Erro ao carregar dados locais, usando seed padrão:', e);
      setStockLocations(initialStockLocations);
      setChannelTypes(initialChannelTypes);
      setCategories(initialCategories);
      setSuppliers(initialSuppliers);
      setCustomers(initialCustomers);
      setProducts(initialProducts);
      setPurchaseOrders(initialPurchaseOrders);
      setSalesOrders(initialSalesOrders);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persistência quando o estado muda
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_LOCATIONS, JSON.stringify(stockLocations));
      localStorage.setItem(STORAGE_KEYS.CHANNEL_TYPES, JSON.stringify(channelTypes));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
      localStorage.setItem(STORAGE_KEYS.SALES_ORDERS, JSON.stringify(salesOrders));
    } catch (e) {
      console.error('Erro ao persistir no localStorage:', e);
    }
  }, [stockLocations, channelTypes, categories, suppliers, customers, products, purchaseOrders, salesOrders, isLoaded]);

  // Ações de Produtos
  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    initialStocks?: { location_id: string; quantity: number }[]
  ): Promise<Product> => {
    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const inventory: ProductInventory[] = stockLocations.map((loc) => {
      const match = initialStocks?.find((s) => s.location_id === loc.id);
      return {
        id: `inv-${newId}-${loc.id}`,
        product_id: newId,
        stock_location_id: loc.id,
        quantity: match ? Number(match.quantity) : 0,
        reserved_quantity: 0,
        min_quantity_alert: 5,
        created_at: now,
        updated_at: now,
        stock_location: loc,
      };
    });

    const newProduct: Product = {
      ...productData,
      id: newId,
      created_at: now,
      updated_at: now,
      inventory,
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Ações de Estoque & Locais
  const addStockLocation = async (
    locationData: Omit<StockLocation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<StockLocation> => {
    const newId = `loc-${Date.now()}`;
    const now = new Date().toISOString();
    const newLocation: StockLocation = {
      ...locationData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    setStockLocations((prev) => [...prev, newLocation]);

    // Atualiza todos os produtos existentes para incluir esse novo local de estoque
    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        inventory: [
          ...(prod.inventory || []),
          {
            id: `inv-${prod.id}-${newId}`,
            product_id: prod.id,
            stock_location_id: newId,
            quantity: 0,
            reserved_quantity: 0,
            min_quantity_alert: 5,
            created_at: now,
            updated_at: now,
            stock_location: newLocation,
          },
        ],
      }))
    );

    return newLocation;
  };

  const updateStockLocation = async (id: string, updates: Partial<StockLocation>) => {
    setStockLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updates, updated_at: new Date().toISOString() } : loc))
    );
  };

  const deleteStockLocation = async (id: string) => {
    setStockLocations((prev) => prev.filter((loc) => loc.id !== id));
    // Remove inventário associado nos produtos
    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        inventory: (prod.inventory || []).filter((inv) => inv.stock_location_id !== id),
      }))
    );
  };

  const updateStockQuantity = async (productId: string, locationId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const currentInv = prod.inventory || [];
        const exists = currentInv.some((inv) => inv.stock_location_id === locationId);

        const newInventory = exists
          ? currentInv.map((inv) =>
              inv.stock_location_id === locationId ? { ...inv, quantity: Math.max(0, quantity), updated_at: new Date().toISOString() } : inv
            )
          : [
              ...currentInv,
              {
                id: `inv-${prod.id}-${locationId}`,
                product_id: prod.id,
                stock_location_id: locationId,
                quantity: Math.max(0, quantity),
                reserved_quantity: 0,
                min_quantity_alert: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];

        return { ...prod, inventory: newInventory };
      })
    );
  };

  const transferStock = async (productId: string, fromLocationId: string, toLocationId: string, quantity: number) => {
    if (quantity <= 0 || fromLocationId === toLocationId) return;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const currentInv = [...(prod.inventory || [])];
        const fromItem = currentInv.find((i) => i.stock_location_id === fromLocationId);
        if (!fromItem || fromItem.quantity < quantity) {
          alert('Saldo insuficiente no local de origem!');
          return prod;
        }

        return {
          ...prod,
          inventory: currentInv.map((item) => {
            if (item.stock_location_id === fromLocationId) {
              return { ...item, quantity: item.quantity - quantity, updated_at: new Date().toISOString() };
            }
            if (item.stock_location_id === toLocationId) {
              return { ...item, quantity: item.quantity + quantity, updated_at: new Date().toISOString() };
            }
            return item;
          }),
        };
      })
    );
  };

  // Ações de Tipos de Canal
  const addChannelType = async (data: Omit<ChannelType, 'id' | 'created_at'>): Promise<ChannelType> => {
    const newChannelType: ChannelType = {
      ...data,
      id: `ct-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setChannelTypes((prev) => [...prev, newChannelType]);
    return newChannelType;
  };

  const updateChannelType = async (id: string, updates: Partial<ChannelType>) => {
    setChannelTypes((prev) =>
      prev.map((ct) => (ct.id === id ? { ...ct, ...updates } : ct))
    );
  };

  const deleteChannelType = async (id: string) => {
    setChannelTypes((prev) => prev.filter((ct) => ct.id !== id));
  };

  // Ações de Categorias
  const addCategory = async (data: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Ações de Clientes
  const addCustomer = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Ações de Fornecedores
  const addSupplier = async (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
    );
  };

  const deleteSupplier = async (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // Ações de Compras (Entrada de estoque + Custo)
  const createPurchaseOrder = async (
    data: Omit<PurchaseOrder, 'id' | 'order_number' | 'status' | 'total_amount' | 'created_at' | 'updated_at'>,
    items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'subtotal'>[]
  ): Promise<PurchaseOrder> => {
    const newId = `po-${Date.now()}`;
    const orderNumber = `OC-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    let totalAmount = 0;
    const processedItems: PurchaseOrderItem[] = items.map((item, idx) => {
      const subtotal = item.quantity * item.unit_cost_price;
      totalAmount += subtotal;
      return {
        ...item,
        id: `poi-${newId}-${idx}`,
        purchase_order_id: newId,
        subtotal,
      };
    });

    const newOrder: PurchaseOrder = {
      ...data,
      id: newId,
      order_number: orderNumber,
      status: 'received',
      total_amount: totalAmount,
      received_at: now,
      created_at: now,
      updated_at: now,
      items: processedItems,
    };

    // Atualiza estoque de destino e atualiza o preço de custo dos produtos
    setProducts((prev) =>
      prev.map((prod) => {
        const itemMatch = items.find((i) => i.product_id === prod.id);
        if (!itemMatch) return prod;

        const currentInv = prod.inventory || [];
        const exists = currentInv.some((inv) => inv.stock_location_id === data.destination_location_id);

        const updatedInventory = exists
          ? currentInv.map((inv) =>
              inv.stock_location_id === data.destination_location_id
                ? { ...inv, quantity: inv.quantity + itemMatch.quantity, updated_at: now }
                : inv
            )
          : [
              ...currentInv,
              {
                id: `inv-${prod.id}-${data.destination_location_id}`,
                product_id: prod.id,
                stock_location_id: data.destination_location_id,
                quantity: itemMatch.quantity,
                reserved_quantity: 0,
                min_quantity_alert: 5,
                created_at: now,
                updated_at: now,
              },
            ];

        return {
          ...prod,
          cost_price: itemMatch.unit_cost_price, // Atualiza para o novo custo unitário de aquisição
          inventory: updatedInventory,
          updated_at: now,
        };
      })
    );

    setPurchaseOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // Ações de Vendas (Baixa de estoque no canal + Lucro Bruto congelado)
  const createSalesOrder = async (
    data: Omit<SalesOrder, 'id' | 'order_number' | 'status' | 'subtotal' | 'total_amount' | 'total_cost' | 'gross_profit' | 'created_at' | 'updated_at'>,
    items: Omit<SalesOrderItem, 'id' | 'sales_order_id' | 'subtotal' | 'profit' | 'unit_cost_price'>[]
  ): Promise<SalesOrder> => {
    const newId = `so-${Date.now()}`;
    const orderNumber = `PED-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    let subtotal = 0;
    let totalCost = 0;

    const processedItems: SalesOrderItem[] = items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.product_id);
      const unitCost = prod?.cost_price || 0;
      const itemSubtotal = item.quantity * item.unit_sale_price;
      const itemCost = item.quantity * unitCost;
      const itemProfit = itemSubtotal - itemCost;

      subtotal += itemSubtotal;
      totalCost += itemCost;

      return {
        ...item,
        id: `soi-${newId}-${idx}`,
        sales_order_id: newId,
        unit_cost_price: unitCost,
        subtotal: itemSubtotal,
        profit: itemProfit,
      };
    });

    const discount = data.discount || 0;
    const shippingFee = data.shipping_fee || 0;
    const totalAmount = subtotal - discount + shippingFee;
    const grossProfit = totalAmount - totalCost;

    const newOrder: SalesOrder = {
      ...data,
      id: newId,
      order_number: orderNumber,
      status: 'paid',
      subtotal,
      discount,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      total_cost: totalCost,
      gross_profit: grossProfit,
      created_at: now,
      updated_at: now,
      items: processedItems,
    };

    // Baixa estoque no canal respectivo
    setProducts((prev) =>
      prev.map((prod) => {
        const itemMatch = items.find((i) => i.product_id === prod.id);
        if (!itemMatch) return prod;

        const currentInv = prod.inventory || [];
        const updatedInventory = currentInv.map((inv) =>
          inv.stock_location_id === data.stock_location_id
            ? { ...inv, quantity: Math.max(0, inv.quantity - itemMatch.quantity), updated_at: now }
            : inv
        );

        return {
          ...prod,
          inventory: updatedInventory,
          updated_at: now,
        };
      })
    );

    setSalesOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // Cálculo das Métricas Gerais
  const totalRevenue = salesOrders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
  const totalCost = salesOrders.reduce((acc, order) => acc + (order.total_cost || 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const totalProductsCount = products.length;
  let totalUnitsInStock = 0;
  let lowStockCount = 0;

  products.forEach((prod) => {
    const prodTotal = (prod.inventory || []).reduce((acc, inv) => acc + (inv.quantity || 0), 0);
    totalUnitsInStock += prodTotal;
    if (prodTotal <= 10) {
      lowStockCount++;
    }
  });

  const channelMetrics = stockLocations.map((loc) => {
    const channelSales = salesOrders.filter((s) => s.stock_location_id === loc.id);
    const revenue = channelSales.reduce((acc, s) => acc + s.total_amount, 0);
    const cost = channelSales.reduce((acc, s) => acc + s.total_cost, 0);
    const profit = revenue - cost;

    let stockUnits = 0;
    products.forEach((p) => {
      const inv = (p.inventory || []).find((i) => i.stock_location_id === loc.id);
      if (inv) stockUnits += inv.quantity;
    });

    return {
      locationId: loc.id,
      locationName: loc.name,
      channelType: loc.channel_type,
      totalSales: channelSales.length,
      revenue,
      profit,
      stockUnits,
    };
  });

  return (
    <AppContext.Provider
      value={{
        stockLocations,
        channelTypes,
        categories,
        suppliers,
        customers,
        products,
        purchaseOrders,
        salesOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        addChannelType,
        updateChannelType,
        deleteChannelType,
        addCategory,
        updateCategory,
        deleteCategory,
        addStockLocation,
        updateStockLocation,
        deleteStockLocation,
        updateStockQuantity,
        transferStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        createSalesOrder,
        metrics: {
          totalRevenue,
          totalCost,
          grossProfit,
          profitMargin,
          totalProductsCount,
          totalUnitsInStock,
          lowStockCount,
          channelMetrics,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
