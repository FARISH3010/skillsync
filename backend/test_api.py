import pytest
import io
from fastapi.testclient import TestClient
from main import app, startup_event

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_before_tests():
    startup_event()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()

def test_list_curricula():
    response = client.get("/curricula")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    ids = [c["id"] for c in data]
    assert "curr_cs_2024" in ids
    assert "curr_aids_2024" in ids
    assert "curr_fullstack_2024" in ids

def test_dashboard_gaps():
    response = client.get("/dashboard/gaps?curriculum_id=curr_cs_2024")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "overall_coverage_pct" in data["summary"]
    assert "skills" in data
    assert "recommendations" in data
    assert len(data["skills"]) > 0

def test_curriculum_skills():
    response = client.get("/curriculum/curr_cs_2024/skills")
    assert response.status_code == 200
    data = response.json()
    assert "courses" in data
    assert len(data["courses"]) >= 4

def test_job_postings():
    response = client.get("/jobs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10

def test_what_if_simulator():
    payload = {
        "curriculum_id": "curr_cs_2024",
        "simulated_skill_ids": ["sk_docker", "sk_kubernetes", "sk_aws"]
    }
    response = client.post("/simulator/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    summary = data["summary"]
    assert summary["overall_coverage_pct"] >= summary["baseline_coverage_pct"]
    assert summary["simulated_gain_pct"] > 0

def test_upload_curriculum_text():
    sample_text = """
    Software Engineering Specialization 2024
    Department of Computer Science
    
    Course 1: Cloud-Native Microservices
    Introduction to Docker containerization, Kubernetes clusters, AWS deployment, and CI/CD pipelines.
    
    Course 2: Modern Frontend with React
    Building web apps using React.js, TypeScript, Next.js, and Tailwind CSS.
    """
    file_bytes = io.BytesIO(sample_text.encode('utf-8'))
    response = client.post(
        "/upload/curriculum",
        files={"file": ("sample_syllabus.txt", file_bytes, "text/plain")},
        data={"title": "Cloud & React Specialization", "institution": "Demo University"}
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["extracted_skills_count"] > 0
    new_curr_id = res_data["curriculum_id"]
    
    # Test gap analysis on uploaded curriculum
    gap_res = client.get(f"/dashboard/gaps?curriculum_id={new_curr_id}")
    assert gap_res.status_code == 200
    assert gap_res.json()["summary"]["overall_coverage_pct"] > 0
