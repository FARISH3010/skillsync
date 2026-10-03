import pandas as pd
import numpy as np
from typing import List, Dict, Any

class AnalyticsEngine:
    """
    Core rule-based scoring engine for SkillSync:
    Calculates Coverage, Market Demand, Gap Severity, and Actionable Recommendations.
    """
    
    @staticmethod
    def compute_gap_analysis(
        taxonomy: List[Dict[str, Any]],
        curriculum_skills: List[str],  # list of skill_ids present in curriculum
        job_postings_extractions: List[List[str]], # list of skill_id lists per job
        simulated_additional_skills: List[str] = None
    ) -> Dict[str, Any]:
        simulated_additional_skills = simulated_additional_skills or []
        effective_curriculum_skills = set(curriculum_skills).union(set(simulated_additional_skills))
        
        total_jobs = max(len(job_postings_extractions), 1)
        
        # Skill frequency across all job postings
        demand_counts: Dict[str, int] = {}
        for job_skills in job_postings_extractions:
            for s_id in set(job_skills):
                demand_counts[s_id] = demand_counts.get(s_id, 0) + 1
        
        taxonomy_dict = {item["id"]: item for item in taxonomy}
        
        records = []
        total_market_demand_weight = 0.0
        covered_market_demand_weight = 0.0

        for item in taxonomy:
            s_id = item["id"]
            name = item["name"]
            category = item["category"]
            weight = item.get("importance_weight", 1.0)
            rec_module = item.get("recommended_module", f"Applied {name} Workshop")
            
            # Frequency ratio in market (0.0 to 1.0)
            job_count = demand_counts.get(s_id, 0)
            market_frequency = job_count / total_jobs
            
            # Weighted demand score
            demand_score = round(market_frequency * weight * 100, 1)
            
            # Check presence
            in_curriculum = s_id in curriculum_skills
            in_simulation = s_id in simulated_additional_skills
            is_covered = s_id in effective_curriculum_skills
            
            # Update cumulative demand weights
            if market_frequency > 0:
                total_market_demand_weight += (market_frequency * weight)
                if is_covered:
                    covered_market_demand_weight += (market_frequency * weight)
            
            # Gap score = demand score if missing, 0 if covered
            gap_score = round(demand_score if not is_covered else 0.0, 1)
            
            # Severity classification
            if is_covered:
                status = "COVERED"
                priority = "LOW"
            elif demand_score >= 60:
                status = "CRITICAL_GAP"
                priority = "HIGH"
            elif demand_score >= 30:
                status = "MODERATE_GAP"
                priority = "MEDIUM"
            else:
                status = "LOW_GAP"
                priority = "LOW"

            records.append({
                "skill_id": s_id,
                "name": name,
                "category": category,
                "market_frequency_pct": round(market_frequency * 100, 1),
                "demand_score": demand_score,
                "in_curriculum": in_curriculum,
                "is_simulated": in_simulation,
                "is_covered": is_covered,
                "gap_score": gap_score,
                "priority": priority,
                "status": status,
                "recommended_module": rec_module
            })

        df = pd.DataFrame(records)
        
        # Sort gaps by gap_score descending
        df_sorted = df.sort_values(by=["gap_score", "demand_score"], ascending=[False, False])
        
        # Overall coverage percentage: weighted by market demand
        if total_market_demand_weight > 0:
            overall_coverage_pct = round((covered_market_demand_weight / total_market_demand_weight) * 100, 1)
        else:
            overall_coverage_pct = 0.0

        # Baseline coverage (without simulation)
        baseline_covered_weight = 0.0
        for item in taxonomy:
            s_id = item["id"]
            weight = item.get("importance_weight", 1.0)
            job_count = demand_counts.get(s_id, 0)
            market_freq = job_count / total_jobs
            if s_id in curriculum_skills and market_freq > 0:
                baseline_covered_weight += (market_freq * weight)
        
        baseline_coverage_pct = round((baseline_covered_weight / total_market_demand_weight) * 100, 1) if total_market_demand_weight > 0 else 0.0
        
        # Actionable recommendations: Missing skills prioritized by gap score
        critical_gaps = df_sorted[df_sorted["status"] == "CRITICAL_GAP"].to_dict(orient="records")
        moderate_gaps = df_sorted[df_sorted["status"] == "MODERATE_GAP"].to_dict(orient="records")
        
        recommendations = []
        for gap in critical_gaps + moderate_gaps:
            recommendations.append({
                "skill_id": gap["skill_id"],
                "skill_name": gap["name"],
                "category": gap["category"],
                "priority": gap["priority"],
                "demand_score": gap["demand_score"],
                "recommended_action": gap["recommended_module"],
                "impact_gain_pct": round((gap["demand_score"] / max(total_market_demand_weight * 100, 1)) * 100, 1)
            })

        # Category summary
        category_breakdown = {}
        for cat, group in df.groupby("category"):
            total_cat_skills = len(group)
            covered_cat_skills = int(group["is_covered"].sum())
            cat_coverage = round((covered_cat_skills / total_cat_skills) * 100, 1)
            category_breakdown[cat] = {
                "total_skills": total_cat_skills,
                "covered_skills": covered_cat_skills,
                "coverage_pct": cat_coverage
            }

        return {
            "summary": {
                "overall_coverage_pct": overall_coverage_pct,
                "baseline_coverage_pct": baseline_coverage_pct,
                "simulated_gain_pct": round(overall_coverage_pct - baseline_coverage_pct, 1),
                "total_industry_jobs_analyzed": total_jobs,
                "total_skills_tracked": len(taxonomy),
                "total_gaps_identified": len(critical_gaps) + len(moderate_gaps),
                "critical_gaps_count": len(critical_gaps),
                "moderate_gaps_count": len(moderate_gaps)
            },
            "category_breakdown": category_breakdown,
            "skills": df_sorted.to_dict(orient="records"),
            "recommendations": recommendations
        }
