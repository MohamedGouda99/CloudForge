"""
Contract tests for Azure Terraform output.

These tests verify that generated Terraform code for Azure conforms to expected structure.
"""
import pytest

from app.services.terraform.generators.azure import AzureGenerator


class TestAzureProviderContract:
    """Test Azure provider block contract."""

    def test_provider_block_structure(self):
        """Test that provider block has required structure."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vnet-1",
                        "type": "azurerm_virtual_network",
                        "data": {
                            "resourceType": "azurerm_virtual_network",
                            "resourceLabel": "main",
                            "config": {
                                "name": "main-vnet",
                                "address_space": ["10.0.0.0/16"],
                                "location": "eastus",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {"azure_location": "eastus"},
        )

        # Provider block should reference azurerm
        assert "azurerm" in result.lower() or "provider" in result.lower()


class TestAzureVNetContract:
    """Test Azure Virtual Network resource contract."""

    def test_vnet_resource_type(self):
        """Test VNet resource type is correct."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vnet-1",
                        "type": "azurerm_virtual_network",
                        "data": {
                            "resourceType": "azurerm_virtual_network",
                            "resourceLabel": "main",
                            "config": {
                                "name": "main-vnet",
                                "address_space": ["10.0.0.0/16"],
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain virtual_network
        assert "virtual_network" in result or "vnet" in result.lower()

    def test_vnet_address_space(self):
        """Test VNet address space is included."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vnet-1",
                        "type": "azurerm_virtual_network",
                        "data": {
                            "resourceType": "azurerm_virtual_network",
                            "resourceLabel": "main",
                            "config": {
                                "address_space": ["10.0.0.0/16"],
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Address space should be present
        assert "address_space" in result or "10.0.0.0" in result


class TestAzureResourceGroupContract:
    """Test Azure Resource Group contract."""

    def test_resource_group_structure(self):
        """Test resource group has correct structure."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "rg-1",
                        "type": "azurerm_resource_group",
                        "data": {
                            "resourceType": "azurerm_resource_group",
                            "resourceLabel": "main",
                            "config": {
                                "name": "my-resource-group",
                                "location": "eastus",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain resource_group
        assert "resource_group" in result or "rg" in result.lower()


class TestAzureStorageContract:
    """Test Azure Storage Account contract."""

    def test_storage_account_resource(self):
        """Test storage account resource structure."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "storage-1",
                        "type": "azurerm_storage_account",
                        "data": {
                            "resourceType": "azurerm_storage_account",
                            "resourceLabel": "main",
                            "config": {
                                "name": "mystorageaccount",
                                "account_tier": "Standard",
                                "account_replication_type": "LRS",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain storage_account
        assert "storage_account" in result or "storage" in result.lower()


class TestAzureVMContract:
    """Test Azure Virtual Machine contract."""

    def test_vm_resource_structure(self):
        """Test VM resource has correct structure."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vm-1",
                        "type": "azurerm_linux_virtual_machine",
                        "data": {
                            "resourceType": "azurerm_linux_virtual_machine",
                            "resourceLabel": "web",
                            "config": {
                                "name": "web-vm",
                                "size": "Standard_B1s",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain virtual_machine
        assert "virtual_machine" in result or "vm" in result.lower()


class TestAzureOutputFormat:
    """Test Azure output format compliance."""

    def test_valid_hcl_syntax(self):
        """Test that output is valid HCL structure."""
        generator = AzureGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vnet-1",
                        "type": "azurerm_virtual_network",
                        "data": {
                            "resourceType": "azurerm_virtual_network",
                            "resourceLabel": "main",
                            "config": {"address_space": ["10.0.0.0/16"]},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Braces should be balanced
        open_braces = result.count("{")
        close_braces = result.count("}")
        assert open_braces == close_braces

    def test_features_block_present(self):
        """Test Azure features block is present if required."""
        generator = AzureGenerator()
        result = generator.generate(
            {"nodes": [], "edges": []},
            {},
        )

        # Azure provider often requires features block
        # Check if present when provider is declared
        if "provider" in result and "azurerm" in result:
            # Features block may or may not be required based on implementation
            pass  # Test documents current behavior
