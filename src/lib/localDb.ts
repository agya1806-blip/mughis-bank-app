type Tables = "wallets" | "categories" | "customers" | "products" | "transactions" | "invoices" | "invoice_items" | "debts" | "receivables" | "business_profiles" | "payment_methods" | "spec_print" | "spec_laptop" | "spec_umum" | "budgets" | "audit_logs" | "user_preferences" | "ai_insights";

let db: Record<string, any[]> = {};
let currentUser: any = null;

function uid(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadDb(): Record<string, any[]> {
  try {
    const raw = localStorage.getItem("mughis_db");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveDb() {
  localStorage.setItem("mughis_db", JSON.stringify(db));
}

function getItems(table: Tables): any[] {
  return db[table] || [];
}

function setItems(table: Tables, items: any[]) {
  db[table] = items;
  saveDb();
}

function seedData() {
  if (getItems("wallets").length > 0) return;

  const defaultUserId = "local-user-1";

  setItems("wallets", [
    { id: uid(), user_id: defaultUserId, name: "Tunai", type: "cash", icon: "💵", balance: 0, is_active: true, created_at: new Date().toISOString() },
  ]);

  setItems("categories", [
    { id: uid(), user_id: defaultUserId, name: "Makanan", type: "expense", icon: "🍽️", color: "#ef4444", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Transportasi", type: "expense", icon: "🚗", color: "#f97316", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Belanja", type: "expense", icon: "🛒", color: "#eab308", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Tagihan", type: "expense", icon: "📋", color: "#06b6d4", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Kesehatan", type: "expense", icon: "🏥", color: "#22c55e", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Hiburan", type: "expense", icon: "🎮", color: "#a855f7", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Lainnya", type: "expense", icon: "📦", color: "#6b7280", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Gaji", type: "income", icon: "💰", color: "#22c55e", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Bisnis", type: "income", icon: "💼", color: "#3b82f6", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Investasi", type: "income", icon: "📈", color: "#8b5cf6", is_active: true, created_at: new Date().toISOString() },
    { id: uid(), user_id: defaultUserId, name: "Lainnya", type: "income", icon: "📥", color: "#6b7280", is_active: true, created_at: new Date().toISOString() },
  ]);

  setItems("user_preferences", [
    { id: uid(), user_id: defaultUserId, theme: "system", currency: "IDR", language: "id", ai_enabled: true, ai_api_key: "", notifications_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  setItems("business_profiles", [
    { id: uid(), user_id: defaultUserId, business_name: "", business_category: "", phone: "", whatsapp: "", email: "", address: "", logo_url: "", tax_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  setItems("customers", []);
  setItems("products", []);
  setItems("transactions", []);
  setItems("invoices", []);
  setItems("invoice_items", []);
  setItems("debts", []);
  setItems("receivables", []);
  setItems("payment_methods", []);
  setItems("spec_print", []);
  setItems("spec_laptop", []);
  setItems("spec_umum", []);
  setItems("budgets", []);
  setItems("audit_logs", []);
  setItems("ai_insights", []);
}

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (typeof localStorage === "undefined") return;
  db = loadDb();
  seedData();
  currentUser = getLocalUser();
  initialized = true;
}

function resolveJoins(items: any[], select: string): any[] {
  const joinMatch = select.match(/, (\w+)\((\*|\w+)\)/);
  if (!joinMatch) return items;
  const joinTable = joinMatch[1] as Tables;
  const joinItems = getItems(joinTable);
  const fkMap: Record<string, any> = {};
  for (const j of joinItems) {
    fkMap[j.id] = j;
  }
  const fkField = joinTable === "customers" ? "customer_id" : joinTable === "wallets" ? "wallet_id" : joinTable === "categories" ? "category_id" : `${joinTable.slice(0, -1)}_id`;
  return items.map((item) => {
    const fk = item[fkField] || item[`${joinTable.slice(0, -1)}_id`];
    return { ...item, [joinTable]: fk ? fkMap[fk] || null : null };
  });
}

function getLocalUser(): any {
  try {
    const raw = localStorage.getItem("mughis_auth");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalUser(u: any) {
  localStorage.setItem("mughis_auth", JSON.stringify(u));
  currentUser = u;
}

function removeLocalUser() {
  localStorage.removeItem("mughis_auth");
  currentUser = null;
}

if (typeof localStorage !== "undefined") {
  ensureInit();
}

export function createClient() {
  ensureInit();
  class QueryBuilder {
    private table: Tables;
    private selectCols = "*";
    private filters: Array<{ field: string; value: any }> = [];
    private orderField = "";
    private orderAsc = true;
    private limitCount = 0;
    private isSingle = false;
    private isInsert = false;
    private insertData: any = null;
    private isUpdate = false;
    private updateData: any = null;
    private isDelete = false;
    private isUpsert = false;
    private upsertData: any = null;

    constructor(table: Tables) {
      this.table = table;
    }

    select(cols: string = "*") {
      this.selectCols = cols;
      return this;
    }

    insert(data: any) {
      this.isInsert = true;
      this.insertData = data;
      return this;
    }

    update(data: any) {
      this.isUpdate = true;
      this.updateData = data;
      return this;
    }

    delete() {
      this.isDelete = true;
      return this;
    }

    upsert(data: any) {
      this.isUpsert = true;
      this.upsertData = data;
      return this;
    }

    eq(field: string, value: any) {
      this.filters.push({ field, value });
      return this;
    }

    order(field: string, opts?: { ascending?: boolean }) {
      this.orderField = field;
      this.orderAsc = opts?.ascending !== false;
      return this;
    }

    limit(n: number) {
      this.limitCount = n;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    maybeSingle() {
      this.isSingle = true;
      return this;
    }

    async then(resolve: (value: any) => any) {
      if (this.isInsert) {
        return resolve(this._handleInsert());
      }
      if (this.isUpdate) {
        return resolve(this._handleUpdate());
      }
      if (this.isDelete) {
        return resolve(this._handleDelete());
      }
      if (this.isUpsert) {
        return resolve(this._handleUpsert());
      }
      return resolve(this._handleSelect());
    }

    private _applyFilters(items: any[]) {
      return items.filter((item) => {
        for (const f of this.filters) {
          if (item[f.field] !== f.value) return false;
        }
        return true;
      });
    }

    private _handleSelect() {
      let items = getItems(this.table);
      items = this._applyFilters(items);
      if (this.orderField) {
        items = [...items].sort((a, b) => {
          const va = a[this.orderField] ?? "";
          const vb = b[this.orderField] ?? "";
          if (typeof va === "string") {
            return this.orderAsc ? va.localeCompare(vb) : vb.localeCompare(va);
          }
          return this.orderAsc ? va - vb : vb - va;
        });
      }
      if (this.limitCount > 0) items = items.slice(0, this.limitCount);
      items = resolveJoins(items, this.selectCols);
      if (this.isSingle) return { data: items[0] || null, error: null };
      return { data: items, error: null, count: null, status: 200, statusText: "OK" };
    }

    private _handleInsert() {
      const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const newRows = rows.map((r: any) => {
        const row = { ...r, id: r.id || uid(), created_at: r.created_at || new Date().toISOString() };
        return row;
      });
      const existing = getItems(this.table);
      setItems(this.table, [...existing, ...newRows]);

      if (this.isSingle) return { data: newRows[0], error: null };
      return { data: newRows, error: null };
    }

    private _handleUpdate() {
      const items = getItems(this.table);
      const updated = items.map((item) => {
        for (const f of this.filters) {
          if (item[f.field] !== f.value) return item;
        }
        return { ...item, ...this.updateData, updated_at: new Date().toISOString() };
      });
      setItems(this.table, updated);
      return { data: updated, error: null };
    }

    private _handleDelete() {
      let items = getItems(this.table);
      items = items.filter((item) => {
        for (const f of this.filters) {
          if (item[f.field] === f.value) return false;
        }
        return true;
      });
      setItems(this.table, items);
      return { data: items, error: null };
    }

    private _handleUpsert() {
      const row = this.upsertData;
      const items = getItems(this.table);
      if (row.id) {
        const idx = items.findIndex((i) => i.id === row.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...row, updated_at: new Date().toISOString() };
          setItems(this.table, items);
          return { data: items[idx], error: null };
        }
      }
      const newRow = { ...row, id: row.id || uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setItems(this.table, [...items, newRow]);
      return { data: newRow, error: null };
    }
  }

  return {
    auth: {
      getUser: async () => {
        const user = getLocalUser();
        return { data: { user } };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const users = loadUsers();
        const found = users.find((u: any) => u.email === email && u.password === password);
        if (!found) return { error: { message: "Email atau password salah" } };
        const userData = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name } };
        saveLocalUser(userData);
        return { data: { user: userData }, error: null };
      },
      signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
        const users = loadUsers();
        if (users.find((u: any) => u.email === email)) return { error: { message: "Email sudah terdaftar" } };
        const newUser = { id: uid(), email, password, full_name: options?.data?.full_name || "", created_at: new Date().toISOString() };
        users.push(newUser);
        saveUsers(users);
        const userData = { id: newUser.id, email: newUser.email, user_metadata: { full_name: newUser.full_name } };
        return { data: { user: userData }, error: null };
      },
      signInWithOAuth: async () => {
        return { error: { message: "OAuth tidak tersedia di mode lokal" } };
      },
      signOut: async () => {
        removeLocalUser();
        return { error: null };
      },
      resetPasswordForEmail: async (email: string) => {
        const users = loadUsers();
        const found = users.find((u: any) => u.email === email);
        if (!found) return { error: { message: "Email tidak ditemukan" } };
        return { error: null };
      },
    },
    from: (table: Tables) => new QueryBuilder(table),
    rpc: async (fn: string, params: any) => {
      if (fn === "update_wallet_balance") {
        const items = getItems("wallets");
        const idx = items.findIndex((w) => w.id === params.wallet_id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], balance: (items[idx].balance || 0) + (params.diff || 0) };
          setItems("wallets", items);
        }
        return { data: null, error: null };
      }
      return { data: null, error: null };
    },
  };
}

function loadUsers(): any[] {
  try {
    const raw = localStorage.getItem("mughis_users");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveUsers(users: any[]) {
  localStorage.setItem("mughis_users", JSON.stringify(users));
  if (users.length > 0 && !currentUser) {
    const first = users[0];
    saveLocalUser({ id: first.id, email: first.email, user_metadata: { full_name: first.full_name || "" } });
  }
}

function getFirstUserId(): string {
  const users = loadUsers();
  return users.length > 0 ? users[0].id : "local-user-1";
}

export function exportDb(): string {
  const full = loadDb();
  const users = loadUsers();
  const auth = getLocalUser();
  return JSON.stringify({ db: full, users, auth }, null, 2);
}

export function importDb(jsonStr: string): string | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.db) return "Format file tidak valid";
    localStorage.setItem("mughis_db", JSON.stringify(parsed.db));
    if (parsed.users) localStorage.setItem("mughis_users", JSON.stringify(parsed.users));
    if (parsed.auth) localStorage.setItem("mughis_auth", JSON.stringify(parsed.auth));
    initialized = false;
    ensureInit();
    return null;
  } catch (e: any) {
    return "Gagal import: " + e.message;
  }
}
