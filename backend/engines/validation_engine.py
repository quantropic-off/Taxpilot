class ValidationEngine:
    """
    Mock engine for pre-filing schema checks and data validation.
    """
    
    @staticmethod
    def validate_gst_schema(payload: dict, form_type: str) -> dict:
        """
        Validate a GST JSON payload against the expected schema (GSTR-1, GSTR-3B).
        """
        return {
            "is_valid": True,
            "errors": []
        }
        
    @staticmethod
    def validate_itr_schema(payload: dict, form_type: str) -> dict:
        """
        Validate an ITR JSON payload (ITR-1, ITR-4) against departmental schema rules.
        """
        return {
            "is_valid": True,
            "errors": []
        }
