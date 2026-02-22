# 🎯 AZIONE RICHIESTA: Configurazione Environment Variables

## 📋 Cosa Fare ORA

Vai nelle **Environment Variables** del progetto Spark e aggiungi:

### Variabili da Aggiungere:

| Nome della Variabile | Valore | Dove Trovarla |
|---------------------|--------|---------------|
| `VITE_SUPABASE_URL` | `https://nhioknfognhlqdosvimc.supabase.co` | Già configurata |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_8Xyfs4jrO77rZVi3IGRQvw_m5OhpqyU` | Già configurata |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | **DA AGGIUNGERE** - [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |

---

## 🔐 Come Ottenere la Chiave Stripe

1. **Accedi a Stripe Dashboard**: https://dashboard.stripe.com
2. **Vai su Developers → API keys**
3. **Copia la Publishable key** (quella che inizia con `pk_test_` per test mode)
4. **Incollala come valore di** `VITE_STRIPE_PUBLISHABLE_KEY`

⚠️ **ATTENZIONE:** 
- ✅ USA la **Publishable key** (pk_test_... o pk_live_...)
- ❌ NON usare la **Secret key** (sk_test_... o sk_live_...)

---

## 🚀 Dopo Aver Aggiunto le Variabili

1. ✅ **Salva** le modifiche nelle Environment Variables
2. ✅ **Redeploy/Restart** l'applicazione Spark
3. ✅ **Attendi** che il deploy completi (1-2 minuti)
4. ✅ **Testa** l'applicazione

---

## 🧪 Test Mode vs Production Mode

### Test Mode (Sviluppo)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx...
```
- Pagamenti simulati
- Nessuna carta reale viene addebitata
- Usa carte di test Stripe

### Production Mode (Produzione)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx...
```
- Pagamenti reali
- Carte reali vengono addebitate
- Usa SOLO quando sei pronto per il lancio

**Per l'MVP, usa TEST MODE!**

---

## 📚 Documentazione Dettagliata

- [SPARK_ENV_SETUP.md](./SPARK_ENV_SETUP.md) - Guida passo-passo
- [ENV_VARS.md](./ENV_VARS.md) - Riferimento completo
- [Stripe Testing Cards](https://stripe.com/docs/testing#cards) - Carte di test

---

## ✅ Codice Già Pronto

Ho già preparato:
- ✅ `src/lib/stripeClient.ts` - Client Stripe configurato
- ✅ `src/lib/supabaseClient.ts` - Client Supabase aggiornato
- ✅ Gestione errori per variabili mancanti
- ✅ Documentazione completa

**Tutto quello che devi fare è aggiungere la chiave Stripe nelle Environment Variables di Spark!**
