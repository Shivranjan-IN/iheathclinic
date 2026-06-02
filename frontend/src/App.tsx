import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { Toaster } from "./common/ui/sonner";
import { AppRouter } from "./routes/AppRouter";
// Types are now centrally managed in common/types.ts

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <AuthProvider>
          <NavigationProvider>
            <CartProvider>
              <AppRouter />
              <Toaster />
            </CartProvider>
          </NavigationProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}