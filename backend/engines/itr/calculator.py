class ITRCalculator:
    """
    Mock engine for calculating Income Tax under old and new regimes.
    """
    
    @staticmethod
    def compute_tax_old_regime(income: dict, deductions: dict) -> dict:
        """
        Compute tax based on old tax slabs.
        """
        return {
            "gross_total_income": 0.0,
            "total_deductions": 0.0,
            "net_taxable_income": 0.0,
            "tax_amount": 0.0,
            "surcharge": 0.0,
            "cess": 0.0,
            "total_tax_liability": 0.0
        }
        
    @staticmethod
    def compute_tax_new_regime(income: dict) -> dict:
        """
        Compute tax based on new tax slabs (Section 115BAC).
        """
        return {
            "gross_total_income": 0.0,
            "total_deductions": 0.0, # minimal/standard
            "net_taxable_income": 0.0,
            "tax_amount": 0.0,
            "surcharge": 0.0,
            "cess": 0.0,
            "total_tax_liability": 0.0
        }
        
    @staticmethod
    def recommend_regime(income: dict, deductions: dict) -> dict:
        """
        Compare old and new regimes and return the recommended one.
        """
        return {
            "recommended_regime": "old",
            "savings": 0.0
        }
