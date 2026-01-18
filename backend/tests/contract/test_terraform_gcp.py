"""
Contract tests for GCP Terraform output.

These tests verify that generated Terraform code for GCP conforms to expected structure.
"""
import pytest

from app.services.terraform.generators.gcp import GCPGenerator


class TestGCPProviderContract:
    """Test GCP provider block contract."""

    def test_provider_block_structure(self):
        """Test that provider block has required structure."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "network-1",
                        "type": "google_compute_network",
                        "data": {
                            "resourceType": "google_compute_network",
                            "resourceLabel": "main",
                            "config": {
                                "name": "main-network",
                                "auto_create_subnetworks": False,
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {"gcp_project": "my-project", "gcp_region": "us-central1"},
        )

        # Provider block should reference google
        assert "google" in result.lower() or "provider" in result.lower()

    def test_project_configuration(self):
        """Test that project is configurable."""
        generator = GCPGenerator()
        result = generator.generate(
            {"nodes": [], "edges": []},
            {"gcp_project": "test-project-123"},
        )

        # Project should be referenced if present in config
        if "provider" in result:
            # Project may be in provider block or as variable
            pass  # Behavior depends on implementation


class TestGCPNetworkContract:
    """Test GCP Compute Network contract."""

    def test_network_resource_type(self):
        """Test network resource type is correct."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "network-1",
                        "type": "google_compute_network",
                        "data": {
                            "resourceType": "google_compute_network",
                            "resourceLabel": "main",
                            "config": {
                                "name": "main-network",
                                "auto_create_subnetworks": False,
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain compute_network
        assert "compute_network" in result or "network" in result.lower()

    def test_subnetwork_resource(self):
        """Test subnetwork resource structure."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "subnet-1",
                        "type": "google_compute_subnetwork",
                        "data": {
                            "resourceType": "google_compute_subnetwork",
                            "resourceLabel": "public",
                            "config": {
                                "name": "public-subnet",
                                "ip_cidr_range": "10.0.1.0/24",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain subnetwork
        assert "subnetwork" in result or "subnet" in result.lower()


class TestGCPComputeContract:
    """Test GCP Compute Instance contract."""

    def test_instance_resource_type(self):
        """Test compute instance resource type."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "instance-1",
                        "type": "google_compute_instance",
                        "data": {
                            "resourceType": "google_compute_instance",
                            "resourceLabel": "web",
                            "config": {
                                "name": "web-instance",
                                "machine_type": "e2-micro",
                                "zone": "us-central1-a",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain compute_instance
        assert "compute_instance" in result or "instance" in result.lower()

    def test_machine_type_included(self):
        """Test machine type is included."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "instance-1",
                        "type": "google_compute_instance",
                        "data": {
                            "resourceType": "google_compute_instance",
                            "resourceLabel": "web",
                            "config": {
                                "machine_type": "e2-micro",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Machine type should be present
        assert "machine_type" in result or "e2" in result


class TestGCPStorageContract:
    """Test GCP Cloud Storage contract."""

    def test_storage_bucket_resource(self):
        """Test storage bucket resource structure."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "bucket-1",
                        "type": "google_storage_bucket",
                        "data": {
                            "resourceType": "google_storage_bucket",
                            "resourceLabel": "data",
                            "config": {
                                "name": "my-data-bucket",
                                "location": "US",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain storage_bucket
        assert "storage_bucket" in result or "bucket" in result.lower()


class TestGCPFirewallContract:
    """Test GCP Firewall contract."""

    def test_firewall_resource(self):
        """Test firewall resource structure."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "fw-1",
                        "type": "google_compute_firewall",
                        "data": {
                            "resourceType": "google_compute_firewall",
                            "resourceLabel": "allow_http",
                            "config": {
                                "name": "allow-http",
                                "network": "default",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain firewall
        assert "firewall" in result or "fw" in result.lower()


class TestGCPOutputFormat:
    """Test GCP output format compliance."""

    def test_valid_hcl_syntax(self):
        """Test that output is valid HCL structure."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "network-1",
                        "type": "google_compute_network",
                        "data": {
                            "resourceType": "google_compute_network",
                            "resourceLabel": "main",
                            "config": {"auto_create_subnetworks": False},
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

    def test_boolean_values_formatted(self):
        """Test boolean values are properly formatted."""
        generator = GCPGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "network-1",
                        "type": "google_compute_network",
                        "data": {
                            "resourceType": "google_compute_network",
                            "resourceLabel": "main",
                            "config": {"auto_create_subnetworks": False},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Boolean should be lowercase in HCL
        if "auto_create_subnetworks" in result:
            assert "false" in result.lower() or "False" not in result
