# 🔧 Configurazione Environment Variables in Spark

## ✅ Variabili da Aggiungere

Devi aggiungere queste **3 variabili** nelle Environment Variables del tuo progetto Spark:

### 1. VITE_SUPABASE_URL
```
https://nhioknfognhlqdosvimc.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
sb_publishable_8Xyfs4jrO77rZVi3IGRQvw_m5OhpqyU
```

### 3. VITE_STRIPE_PUBLISHABLE_KEY
```
pk_test_... (la tua chiave publishable da Stripe Dashboard)
```

---

## 📍 Come Aggiungere le Variabili in Spark

1. **Vai alle impostazioni del progetto Spark**
   - Apri il tuo progetto su GitHub Spark
   - Clicca su **Settings** o **Environment Variables**

2. **Aggiungi ogni variabile:**
   
   **Nome:** `VITE_SUPABASE_URL`  
   **Valore:** `https://nhioknfognhlqdosvimc.supabase.co`
   
   **Nome:** `VITE_SUPABASE_ANON_KEY`  
   **Valore:** `sb_publishable_8Xyfs4jrO77rZVi3IGRQvw_m5OhpqyU`
   
   **Nome:** `VITE_STRIPE_PUBLISHABLE_KEY`  
   **Valore:** `pk_test_...` (la tua chiave da Stripe)

3. **Salva le modifiche**

4. **Redeploy/Restart l'applicazione**
   - Dopo aver aggiunto le variabili, è necessario fare redeploy
   - Questo permette all'app di leggere le nuove configurazioni

---

## 🔑 Come Ottenere la Chiave Stripe

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com)
2. Clicca su **Developers** nel menu in alto
3. Vai su **API keys**
4. Copia la chiave **Publishable key**:
   - Per test: `pk_test_...`
   - Per produzione: `pk_live_...`

⚠️ **IMPORTANTE:** Usa solo la **Publishable key**, MAI la Secret key nel frontend!

---

## ⚙️ Per Sviluppo Locale (Opzionale)

Se vuoi testare localmente, crea un file `.env` nella root del progetto:

```bash
VITE_SUPABASE_URL=https://nhioknfognhlqdosvimc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8Xyfs4jrO77rZVi3IGRQvw_m5OhpqyU
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Poi riavvia il dev server:
```bash
npm run dev
```

---

## ✅ Verifica

Dopo aver aggiunto le variabili e fatto redeploy, l'app dovrebbe:
- ✅ Connettersi a Supabase senza errori
- ✅ Mostrare il modulo di pagamento Stripe
- ✅ Non mostrare errori tipo "Missing VITE_STRIPE_PUBLISHABLE_KEY"

---

## 🆘 Troubleshooting

### Errore: "Missing VITE_STRIPE_PUBLISHABLE_KEY"

**Causa:** La variabile non è stata impostata o il deploy non è stato fatto

**Soluzione:**
1. Verifica di aver aggiunto la variabile con il nome esatto: `VITE_STRIPE_PUBLISHABLE_KEY`
2. Fai redeploy dell'applicazione
3. Aspetta qualche minuto che il deploy completi

### Stripe non funziona

**Causa:** Chiave sbagliata o non valida

**Soluzione:**
1. Verifica di aver copiato la **Publishable key** (inizia con `pk_`)
2. NON usare la Secret key (inizia con `sk_`)
3. Ricontrolla che non ci siano spazi extra all'inizio o alla fine

---

## 📚 Documentazione Completa

- [ENV_VARS.md](./ENV_VARS.md) - Guida completa alle variabili d'ambiente
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guida al deployment
- [SECURITY.md](./SECURITY.md) - Best practices di sicurezza
