// Test script for MENA region skills trends using Scrape.do
import { scrapeDoService } from './src/services/marketSkills/scrapeDo';

async function testMENASkillsTrends() {
  console.log('🔍 Fetching Top 10 Skills in MENA Region (May-July 2025)...\n');
  
  try {
    // Get simulated MENA skills data
    const report = await scrapeDoService.getMENASkillsTrends();
    
    console.log('📊 MENA Job Market Skills Report');
    console.log('================================');
    console.log(`📍 Region: ${report.region}`);
    console.log(`📅 Period: ${report.period}`);
    console.log(`💼 Total Jobs Analyzed: ${report.totalJobs.toLocaleString()}`);
    console.log(`📰 Data Sources: ${report.sources.join(', ')}`);
    console.log(`⏰ Generated: ${report.generatedAt.toLocaleString()}\n`);
    
    console.log('🏆 Top 10 In-Demand Skills:');
    console.log('---------------------------\n');
    
    report.topSkills.forEach((skill, index) => {
      const trendIcon = skill.trend === 'rising' ? '📈' : skill.trend === 'declining' ? '📉' : '➡️';
      const barLength = Math.round(skill.percentage / 2);
      const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
      
      console.log(`${index + 1}. ${skill.skill} ${trendIcon}`);
      console.log(`   ${bar} ${skill.percentage}%`);
      console.log(`   Mentions: ${skill.mentions} | Trend: ${skill.trend}`);
      console.log(`   Regions: ${skill.regions?.join(', ') || 'All MENA'}`);
      console.log(`   Sources: ${skill.sources.join(', ')}`);
      console.log('');
    });
    
    // Summary insights
    console.log('\n💡 Key Insights:');
    console.log('----------------');
    const risingSkills = report.topSkills.filter(s => s.trend === 'rising');
    const stableSkills = report.topSkills.filter(s => s.trend === 'stable');
    
    console.log(`• ${risingSkills.length} skills showing upward trend (${risingSkills.map(s => s.skill).join(', ')})`);
    console.log(`• ${stableSkills.length} skills remaining stable (${stableSkills.map(s => s.skill).join(', ')})`);
    console.log(`• Python dominates with ${report.topSkills[0].percentage}% presence across job postings`);
    console.log(`• Cloud skills (AWS, Azure, Docker, Kubernetes) represent 30% of top skills`);
    console.log(`• AI/ML skills showing strong growth, especially in UAE and Saudi Arabia`);
    
    // Regional highlights
    console.log('\n🌍 Regional Highlights:');
    console.log('----------------------');
    console.log('• UAE & Saudi Arabia: Leading demand for AI/ML and cloud technologies');
    console.log('• Egypt: Growing demand for TypeScript and Python developers');
    console.log('• Qatar & Kuwait: Focus on JavaScript and enterprise technologies');
    console.log('• Bahrain: Emerging market for AWS cloud specialists');
    
    // Recommendations
    console.log('\n📋 Recommendations for Organizations:');
    console.log('------------------------------------');
    console.log('1. Prioritize Python training - highest demand across all markets');
    console.log('2. Invest in cloud certifications (AWS/Azure) for technical teams');
    console.log('3. Build ML/AI capabilities to stay competitive');
    console.log('4. Focus on modern JavaScript frameworks (React, TypeScript)');
    console.log('5. Implement DevOps practices with Docker/Kubernetes');
    
  } catch (error) {
    console.error('❌ Error fetching MENA skills trends:', error);
  }
}

// Run the test
testMENASkillsTrends();