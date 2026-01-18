@echo off
echo ========================================
echo ZARQ Theme Restore Script
echo ========================================
echo.
echo This will restore the original DENIVO theme.
echo.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%" neq "y" (
    echo Cancelled.
    exit /b
)

echo Restoring original theme files...
copy /Y backup_theme\App.tsx App.tsx
copy /Y backup_theme\Navbar.tsx components\Navbar.tsx
copy /Y backup_theme\CheckoutPage.tsx components\CheckoutPage.tsx
copy /Y backup_theme\AuthModal.tsx components\AuthModal.tsx
copy /Y backup_theme\AIAssistant.tsx components\AIAssistant.tsx
copy /Y backup_theme\ProductDetailPage.tsx components\ProductDetailPage.tsx
copy /Y backup_theme\AdminPanel.tsx components\AdminPanel.tsx
copy /Y backup_theme\CartSidebar.tsx components\CartSidebar.tsx
copy /Y backup_theme\ProductCard.tsx components\ProductCard.tsx
copy /Y backup_theme\SupabaseSetup.tsx components\SupabaseSetup.tsx

echo.
echo Theme restored! Run 'npm run build' and 'vercel deploy --prod' to deploy.
pause
