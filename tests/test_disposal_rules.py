import pytest
from app.services.disposal_rules import disposal_rules_service, CATEGORY_METADATA, SUPPORTED_CATEGORIES


def test_all_categories_covered():
    """Verify all 9 mandatory waste categories are configured with valid disposal metadata."""
    expected_categories = [
        "Plastic", "Paper", "Cardboard", "Glass", "Metal",
        "Organic", "E-Waste", "Hazardous Waste", "Other/Unknown"
    ]
    for cat in expected_categories:
        assert cat in CATEGORY_METADATA, f"Category '{cat}' missing from metadata registry."
        meta = CATEGORY_METADATA[cat]
        assert "recommended_bin" in meta
        assert "bin_color_hex" in meta
        assert "bin_badge" in meta
        assert "default_disposal_method" in meta
        assert isinstance(meta["recyclable"], bool)


def test_item_specific_override():
    """Verify item-specific overrides take precedence (e.g. battery, pizza box)."""
    battery_info = disposal_rules_service.get_recommendation("battery", "E-Waste")
    assert "battery" in battery_info.recommended_bin.lower() or "battery" in battery_info.disposal_method.lower()
    assert battery_info.hazard_level == "High"

    pizza_box_info = disposal_rules_service.get_recommendation("pizza box", "Cardboard")
    assert pizza_box_info.recyclable is False  # Grease contamination
    assert "grease" in pizza_box_info.disposal_method.lower() or "grease" in " ".join(pizza_box_info.handling_instructions).lower()


def test_plastic_bottle_recommendation():
    """Verify plastic bottle receives appropriate recycling instructions."""
    info = disposal_rules_service.get_recommendation("plastic bottle", "Plastic")
    assert info.recyclable is True
    assert "Plastic" in info.recommended_bin or "Recycling" in info.recommended_bin
    assert len(info.handling_instructions) > 0
    assert any("rinse" in inst.lower() for inst in info.handling_instructions)


def test_unknown_item_fallback():
    """Verify unmapped items cleanly fallback to category defaults or Other/Unknown."""
    info = disposal_rules_service.get_recommendation("mystery_widget", "Other/Unknown")
    assert info.recyclable is False
    assert "Landfill" in info.recommended_bin or "General" in info.recommended_bin
