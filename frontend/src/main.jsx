import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/axiosConfig.js'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { Provider } from 'react-redux'
import store from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

  let persistor = persistStore(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
       <PersistGate loading={null} persistor={persistor}>
      <App />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          className: 'bg-pink-50 border border-pink-200 text-pink-700',
          style: {
            padding: '16px 20px',
            fontSize: '15px',
            boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.15), 0 8px 10px -6px rgba(236, 72, 153, 0.1)',
            borderRadius: '12px',
          }
        }}
      />
       </PersistGate>
    </Provider>
  </StrictMode>,
)
