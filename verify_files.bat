@echo off
echo StockPulse - File Verification Script
echo ====================================

echo.
echo Checking backend files...
if exist "backend\src\main\java\com\stockpulse\StockPulseApplication.java" (
    echo [OK] Main Application Class
) else (
    echo [MISSING] Main Application Class
)

if exist "backend\src\main\java\com\stockpulse\model\Product.java" (
    echo [OK] Product Entity
) else (
    echo [MISSING] Product Entity
)

if exist "backend\src\main\java\com\stockpulse\model\PricingSuggestion.java" (
    echo [OK] Pricing Suggestion Entity
) else (
    echo [MISSING] Pricing Suggestion Entity
)

if exist "backend\src\main\java\com\stockpulse\model\ReorderSuggestion.java" (
    echo [OK] Reorder Suggestion Entity
) else (
    echo [MISSING] Reorder Suggestion Entity
)

if exist "backend\src\main\java\com\stockpulse\controller\ProductController.java" (
    echo [OK] Product Controller
) else (
    echo [MISSING] Product Controller
)

if exist "backend\src\main\java\com\stockpulse\controller\SuggestionController.java" (
    echo [OK] Suggestion Controller
) else (
    echo [MISSING] Suggestion Controller
)

if exist "backend\src\main\java\com\stockpulse\service\ProductService.java" (
    echo [OK] Product Service
) else (
    echo [MISSING] Product Service
)

if exist "backend\src\main\java\com\stockpulse\engine\PricingStrategy.java" (
    echo [OK] Pricing Strategy Interface
) else (
    echo [MISSING] Pricing Strategy Interface
)

if exist "backend\src\main\java\com\stockpulse\engine\RuleBasedPricingStrategy.java" (
    echo [OK] Rule-Based Pricing Strategy
) else (
    echo [MISSING] Rule-Based Pricing Strategy
)

if exist "backend\src\main\java\com\stockpulse\engine\AiPricingStrategy.java" (
    echo [OK] AI Pricing Strategy
) else (
    echo [MISSING] AI Pricing Strategy
)

if exist "backend\src\main\java\com\stockpulse\ai\AiCommerceAdvisor.java" (
    echo [OK] AI Commerce Advisor
) else (
    echo [MISSING] AI Commerce Advisor
)

if exist "backend\src\main\java\com\stockpulse\agent\InventoryEventListener.java" (
    echo [OK] Inventory Event Listener
) else (
    echo [MISSING] Inventory Event Listener
)

echo.
echo Checking frontend files...
if exist "frontend\src\App.jsx" (
    echo [OK] Main App Component
) else (
    echo [MISSING] Main App Component
)

if exist "frontend\src\components\Header.jsx" (
    echo [OK] Header Component
) else (
    echo [MISSING] Header Component
)

if exist "frontend\src\components\KpiSummary.jsx" (
    echo [OK] KPI Summary Component
) else (
    echo [MISSING] KPI Summary Component
)

if exist "frontend\src\components\CatalogTable.jsx" (
    echo [OK] Catalog Table Component
) else (
    echo [MISSING] Catalog Table Component
)

if exist "frontend\src\components\ApprovalQueue.jsx" (
    echo [OK] Approval Queue Component
) else (
    echo [MISSING] Approval Queue Component
)

echo.
echo Checking documentation files...
if exist "README.md" (
    echo [OK] Main README
) else (
    echo [MISSING] Main README
)

if exist "ADR.md" (
    echo [OK] Architectural Decision Records
) else (
    echo [MISSING] Architectural Decision Records
)

if exist "PROJECT_COMPLETION_SUMMARY.md" (
    echo [OK] Project Completion Summary
) else (
    echo [MISSING] Project Completion Summary
)

if exist "FINAL_SUBMISSION_SUMMARY.md" (
    echo [OK] Final Submission Summary
) else (
    echo [MISSING] Final Submission Summary
)

if exist "BACKEND_ERROR_RESOLUTION.md" (
    echo [OK] Backend Error Resolution Guide
) else (
    echo [MISSING] Backend Error Resolution Guide
)

echo.
echo Verification complete.
pause