import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { MarketIntelligenceRequest } from './MarketIntelligence';


interface MarketIntelligencePDFReportProps {
  request: MarketIntelligenceRequest;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  
  // Header styles
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
  
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  
  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 6,
    padding: 15,
    width: '22%',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Content styles
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'justify',
  },
  
  // List styles
  listItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 15,
  },
  bulletPoint: {
    position: 'absolute',
    left: 0,
    color: '#6b7280',
  },
  
  // Skills table
  skillsTable: {
    marginTop: 10,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
  },
  skillRank: {
    width: 30,
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  skillName: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    fontWeight: 'bold',
  },
  skillPercentage: {
    width: 60,
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'right',
  },
  skillBar: {
    width: 80,
    height: 8,
    backgroundColor: '#e5e7eb',
    marginLeft: 10,
    position: 'relative',
  },
  skillBarFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    position: 'absolute',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  
  // Two-column layout
  twoColumns: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  
  // Callout boxes
  calloutBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'solid',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
  },
  calloutText: {
    fontSize: 10,
    color: '#1e3a8a',
    lineHeight: 1.4,
  },
});

const MarketIntelligencePDFReport: React.FC<MarketIntelligencePDFReportProps> = ({ request }) => {
  // Safely extract data with fallbacks
  const analysisData = request?.analysis_data || {};
  const skillTrends = analysisData?.skill_trends || {};
  const jobsCount = request?.scraped_data?.total_jobs || request?.scraped_data?.jobs_count || 0;
  
  // Ensure we have basic required data
  if (!request) {
    console.error('MarketIntelligencePDFReport: No request data provided');
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Error: No Data Available</Text>
          <Text style={styles.paragraph}>Unable to generate report due to missing data.</Text>
        </Page>
      </Document>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Document>
      {/* Page 1: Executive Summary */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Market Intelligence Report</Text>
          <Text style={styles.subtitle}>{request.position_title}</Text>
          <View style={styles.headerMeta}>
            <Text>Generated: {formatDate(request.updated_at)} ({getRelativeTime(request.updated_at)})</Text>
            <Text>Region: {request.regions?.join(', ') || request.countries?.join(', ')}</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{jobsCount}</Text>
              <Text style={styles.metricLabel}>Jobs Analyzed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{skillTrends.top_skills?.length || 0}</Text>
              <Text style={styles.metricLabel}>Skills Identified</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Object.keys(skillTrends.experience_distribution || {}).length}
              </Text>
              <Text style={styles.metricLabel}>Experience Levels</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{request.date_window}</Text>
              <Text style={styles.metricLabel}>Time Range</Text>
            </View>
          </View>
        </View>

        {/* Executive Summary */}
        {request.ai_insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>Market Analysis</Text>
              <Text style={styles.calloutText}>
                {request.ai_insights.substring(0, 800)}...
              </Text>
            </View>
          </View>
        )}

        {/* Structured Insights */}
        {request.structured_insights?.executive_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Strategic Context</Text>
            <Text style={styles.paragraph}>
              {request.structured_insights.executive_summary.market_context}
            </Text>
            {request.structured_insights.executive_summary.strategic_conclusion && (
              <Text style={styles.paragraph}>
                {request.structured_insights.executive_summary.strategic_conclusion}
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Lxera Market Intelligence • {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Page 2: Skills Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Skills Demand Analysis</Text>
        </View>

        {/* Top Skills Table */}
        {skillTrends.top_skills && skillTrends.top_skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Top Skills in Demand</Text>
            <View style={styles.skillsTable}>
              {skillTrends.top_skills.slice(0, 20).map((skill: any, index: number) => (
                <View key={skill.skill || index} style={styles.skillRow}>
                  <Text style={styles.skillRank}>{index + 1}</Text>
                  <Text style={styles.skillName}>{skill.skill}</Text>
                  <View style={styles.skillBar}>
                    <View 
                      style={[
                        styles.skillBarFill, 
                        { width: `${Math.max(2, skill.percentage)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.skillPercentage}>{skill.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Technical Depth Summary */}
        {analysisData.technical_depth_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Technical Depth Breakdown</Text>
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.paragraph}>
                  Technical Skills: {analysisData.technical_depth_summary.hard_skills_percentage || 0}%
                </Text>
                <Text style={styles.paragraph}>
                  Soft Skills: {analysisData.technical_depth_summary.soft_skills_percentage || 0}%
                </Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.paragraph}>
                  Certifications: {analysisData.technical_depth_summary.skills_with_certifications || 0}
                </Text>
                <Text style={styles.paragraph}>
                  Total Skills: {analysisData.technical_depth_summary.total_skills_analyzed || 0}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Key Findings */}
        {request.structured_insights?.key_findings && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Key Findings</Text>
            {request.structured_insights.key_findings.slice(0, 5).map((finding: any, index: number) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={[styles.paragraph, { fontWeight: 'bold' }]}>
                  {finding.category}
                </Text>
                {finding.insights && finding.insights.slice(0, 3).map((insight: string, i: number) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text>{insight}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Page 2 of 3 • Generated by Lxera Market Intelligence
        </Text>
      </Page>

      {/* Page 3: Strategic Recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
        </View>

        {/* Strategic Recommendations */}
        {request.structured_insights?.strategic_recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Priority Actions</Text>
            {request.structured_insights.strategic_recommendations.map((rec: any, index: number) => (
              <View key={index} style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>
                  {rec.priority ? `Priority ${rec.priority}: ` : `${index + 1}. `}
                  {rec.title}
                </Text>
                <Text style={styles.calloutText}>
                  {rec.description}
                </Text>
                {rec.specific_actions && (
                  <View style={{ marginTop: 8 }}>
                    {rec.specific_actions.slice(0, 3).map((action: string, i: number) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={{ fontSize: 10 }}>{action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skill Combinations */}
        {skillTrends.skill_combinations && skillTrends.skill_combinations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Top Skill Combinations</Text>
            {skillTrends.skill_combinations.slice(0, 8).map((combo: any, index: number) => (
              <View key={index} style={styles.skillRow}>
                <Text style={styles.skillRank}>{index + 1}</Text>
                <Text style={[styles.skillName, { fontSize: 10 }]}>{combo.combination}</Text>
                <Text style={styles.skillPercentage}>{combo.percentage}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience Distribution */}
        {skillTrends.experience_distribution && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Experience Requirements</Text>
            <View style={styles.twoColumns}>
              {Object.entries(skillTrends.experience_distribution).map(([level, count]) => {
                const total = Object.values(skillTrends.experience_distribution).reduce((a: any, b: any) => a + b, 0);
                const percentage = Math.round(((count as any) / total) * 100);
                return (
                  <View key={level} style={{ marginBottom: 8 }}>
                    <Text style={styles.paragraph}>
                      <Text style={{ fontWeight: 'bold' }}>{level}:</Text> {percentage}% ({count} jobs)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Page 3 of 3 • Generated by Lxera Market Intelligence • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default MarketIntelligencePDFReport;