# Realistic Gamification Analytics Wireframes

Based on actual database structure. Two versions: Current (limited data) and Future (with historical data).

## 1. Gamification Overview (Main Dashboard)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎮 Gamification Analytics                    [Refresh] [Export] [Help]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┬─────────────────┬─────────────────┬──────────────┐ │
│ │ Total Players   │ Active Today    │ Avg Level       │ Total Points │ │
│ │ 247            │ 89             │ 3.4            │ 125,420     │ │
│ │                │ 36%            │                │              │ │
│ └─────────────────┴─────────────────┴─────────────────┴──────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────┬─────────────────────────────────┐ │
│ │ 📊 Mission Completion Rates      │ 🏆 Current Leaderboard          │ │
│ │                                  │                                 │ │
│ │ Easy    ████████████░ 89%       │ 1. Player_123  Lvl 8  2,340 pts│ │
│ │ Medium  ███████░░░░░░ 56%       │ 2. Player_456  Lvl 7  2,180 pts│ │
│ │ Hard    ████░░░░░░░░░ 31%       │ 3. Player_789  Lvl 6  1,890 pts│ │
│ │                                  │ 4. Player_012  Lvl 6  1,820 pts│ │
│ │ Total: 542 missions completed    │ 5. Player_345  Lvl 5  1,650 pts│ │
│ └───────────────────────────────────┴─────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🔥 Streak Status                                                    │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ Active Streaks: 78 players (32%)    Longest Current: 23 days       │ │
│ │ Average Streak: 4.2 days            Lost Today: 12 players         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Missions] [Players] [Activity]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Mission Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎯 Mission Performance                    [Sort: Popular ▼] [Filter ▼]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Mission Performance Data                                            │ │
│ ├──────────────────────┬───────┬──────┬──────┬──────┬───────────────┤ │
│ │ Mission              │Cat.   │Plays │Compl%│Acc % │Avg Time       │ │
│ ├──────────────────────┼───────┼──────┼──────┼──────┼───────────────┤ │
│ │ Finance Basics       │FIN    │ 342  │ 89%  │ 82%  │ 8.2 min       │ │
│ │ HR Onboarding       │HR     │ 298  │ 91%  │ 79%  │ 9.4 min       │ │
│ │ Production 101      │PROD   │ 234  │ 68%  │ 65%  │14.3 min       │ │
│ │ Marketing Intro     │MKT    │ 198  │ 76%  │ 71%  │12.1 min       │ │
│ │ Safety Training     │PROD   │ 156  │ 54%  │ 61%  │16.7 min       │ │
│ │ Data Analytics      │GEN    │ 134  │ 82%  │ 88%  │10.2 min       │ │
│ └──────────────────────┴───────┴──────┴──────┴──────┴───────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 📊 Category Distribution │ 🎮 Difficulty Impact on Completion      │ │
│ │                          │                                          │ │
│ │ Production  ████ 45%     │ Completion Rate vs Time:                 │ │
│ │ HR          ███░ 31%     │ <10min:  ████████░ 85%                  │ │
│ │ Finance     ██░░ 18%     │ 10-15min:██████░░ 67%                   │ │
│ │ General     █░░░  6%     │ >15min:  ████░░░░ 42%                   │ │
│ │                          │                                          │ │
│ │ Total: 16 active missions│ ⚠️ Long missions need optimization      │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Missions] [Players] [Activity]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Player Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👥 Player Performance                           [Segment: All ▼]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌────────────────────────────┬────────────────────────────────────────┐ │
│ │ 📊 Level Distribution      │ 🎯 Performance Segments                │ │
│ │                            │                                        │ │
│ │ Level 1-2   ████████ 45%   │ High Performers  ███░░░░░ 18% (45)    │ │
│ │ Level 3-4   ██████░░ 32%   │ (>80% acc, >10 missions/week)         │ │
│ │ Level 5-6   ████░░░░ 18%   │                                        │ │
│ │ Level 7+    █░░░░░░░  5%   │ Regular Players  ████████ 45% (112)   │ │
│ │                            │ (50-80% acc, 5-10 missions/week)      │ │
│ │ Max Level: 15              │                                        │ │
│ │ Avg Level: 3.4             │ Casual Players   ██████░░ 37% (90)    │ │
│ │                            │ (<50% acc, <5 missions/week)          │ │
│ └────────────────────────────┴────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Accuracy Distribution                                            │ │
│ │                                                                     │ │
│ │  40 ┤ ████                                                        │ │
│ │  30 ┤ ████ ████                                                   │ │
│ │  20 ┤ ████ ████ ████                                              │ │
│ │  10 ┤ ████ ████ ████ ██                                           │ │
│ │   0 └────────────────────────────                                 │ │
│ │       0-25  26-50  51-75  76-100  (Accuracy %)                     │ │
│ │                                                                     │ │
│ │ Average Accuracy: 68.3%    Improving: 142 players (57%)            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Engagement Alerts                                   [Manage →]   │ │
│ │ • 23 players inactive for 7+ days                                  │ │
│ │ • 8 players with 3+ failed missions in a row                       │ │
│ │ • 15 players dropped from daily to weekly play                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Missions] [Players] [Activity]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Activity Patterns

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📅 Activity Analysis                           [Today] [This Week]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⏰ Today's Activity Timeline                                        │ │
│ │                                                                     │ │
│ │ Sessions                                                            │ │
│ │  20 ┤      ██                                                      │ │
│ │  15 ┤   ██ ██ ██                                                   │ │
│ │  10 ┤   ██ ██ ██    ██ ██                                          │ │
│ │   5 ┤██ ██ ██ ██ ██ ██ ██ ██                                       │ │
│ │   0 └────────────────────────────────────────                      │ │
│ │     8  9 10 11 12  1  2  3  4  5  6 (Hour)                         │ │
│ │                                                                     │ │
│ │ Peak Hour: 10 AM (18 sessions)    Total Today: 89 sessions         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────┬─────────────────────────────────────────┐ │
│ │ 🧩 Puzzle Progress Stats  │ 🏆 Achievements Unlocked Today         │ │
│ │                           │                                         │ │
│ │ Finance    ████████░ 82%  │ Perfect Score    x12 players           │ │
│ │ HR         ███████░░ 74%  │ Speed Learner    x8 players            │ │
│ │ Production █████░░░░ 53%  │ High Achiever    x23 players           │ │
│ │ Marketing  ██████░░░ 61%  │ Skill Master     x5 players            │ │
│ │                           │                                         │ │
│ │ Pieces Today: 47 unlocked │ Most Common: High Achiever (75%+ acc)  │ │
│ └───────────────────────────┴─────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Session Metrics                                                  │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ Avg Session Duration: 12.4 minutes      Questions/Session: 8.3     │ │
│ │ Completion Rate: 76%                    Retry Rate: 34%            │ │
│ │ Mobile vs Desktop: 42% / 58%            Points/Session: 68         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Missions] [Players] [Activity]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### What's Included:
1. **Real Metrics Only** - Every number can be calculated from existing tables
2. **No Time Series** - Until we have 30+ days of data
3. **No Skills Analytics** - Not tracked in current schema
4. **Category-Based Analysis** - Using mission categories, not skills
5. **Puzzle Progress** - Real data from puzzle_progress table
6. **Achievement Tracking** - From JSONB achievements field

### What's Excluded:
- Historical trends (need more data)
- Skill progression (not tracked)
- Department comparisons (not in employee analytics)
- Predictive analytics (insufficient data)
- Social features beyond leaderboard

### Data Sources:
```sql
-- Every metric shown can be queried:
- employee_game_progress (levels, points, streaks, achievements)
- game_sessions (accuracy, time, completion)
- game_missions (categories, difficulty, metadata)
- puzzle_progress (completion by category)
- Last played dates for activity tracking
```

### Mobile Responsive Design:
- Cards stack vertically on mobile
- Tables become scrollable
- Charts simplify to key metrics
- Tab navigation remains at bottom

This design focuses purely on gamification metrics that exist today, with no overlap with employee or skills analytics tabs.

## Enhanced Analytics WITH Historical Data (30+ Days)

### 1. Enhanced Gamification Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎮 Gamification Analytics                    [Last 30 Days ▼] [Export]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┬─────────────────┬─────────────────┬──────────────┐ │
│ │ Active Players  │ Avg Accuracy    │ Total Points    │ Engagement   │ │
│ │ 247            │ 78.3%          │ 125,420        │ 64%         │ │
│ │ ↑ 12% vs prev  │ ↑ 3.2%         │ ↑ 8,340        │ ↓ 2%        │ │
│ └─────────────────┴─────────────────┴─────────────────┴──────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 30-Day Engagement Trend                                          │ │
│ │                                                                     │ │
│ │ DAU  250 ┤ ╭─╮           ╭╮                                       │ │
│ │      200 ┤╭╯ ╰╮  ╭─╮   ╭╯╰╮                                     │ │
│ │      150 ┤╯   ╰──╯ ╰╮ ╭╯  ╰╮                                    │ │
│ │      100 ┤          ╰─╯    ╰─                                   │ │
│ │          └─────────────────────────────────────────────           │ │
│ │          Week 1    Week 2    Week 3    Week 4                      │ │
│ │                                                                     │ │
│ │ Weekly Active: 412 (↑8%)    Monthly Active: 589 (↑15%)            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────┬─────────────────────────────────┐ │
│ │ 🎯 Mission Trends (30 days)      │ 🏆 Leaderboard Movement         │ │
│ │                                  │                                 │ │
│ │ Completions  ╭────────           │ Top Climbers This Week:         │ │
│ │ 600 ┤       ╱                   │ ↑12 Player_234 (Now #4)        │ │
│ │ 400 ┤    ╱─╯                    │ ↑8  Player_567 (Now #7)        │ │
│ │ 200 ┤ ╱─╯                       │ ↑6  Player_890 (Now #11)       │ │
│ │     └──────────────             │                                 │ │
│ │                                  │ Biggest Drops:                  │ │
│ │ Growth Rate: +23% weekly         │ ↓5  Player_111 (Now #15)       │ │
│ └───────────────────────────────────┴─────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Trends] [Missions] [Players] [Predictions]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Engagement Trends Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Engagement Analytics          [1W] [2W] [1M] [3M] [6M] [Custom ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Multi-Metric Timeline                                            │ │
│ │                                                                     │ │
│ │ 300 ┤ ╭─╮     Sessions ━━━━                                      │ │
│ │ 250 ┤╭╯ ╰╮    Active Users ┅┅┅┅                                  │ │
│ │ 200 ┤┅┅ ┅╰┅╮  Points Earned ····                                 │ │
│ │ 150 ┤  ╰──╯╰╮                                                     │ │
│ │ 100 ┤ ······╰─····                                                │ │
│ │  50 ┤                                                             │ │
│ │   0 └─────────────────────────────────────────────────────       │ │
│ │     Mon   Tue   Wed   Thu   Fri   Sat   Sun                       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ ⏰ Activity Heatmap      │ 📆 Day/Hour Patterns                     │ │
│ │                          │                                          │ │
│ │ Hour  M T W T F S S      │ Peak Times:                             │ │
│ │  8-9  ▓ ▓ ▓ ▓ ▓ ░ ░     │ • Weekdays 9-11 AM (Learning hours)     │ │
│ │  9-10 █ █ █ █ █ ▒ ░     │ • Lunch 1-2 PM (Quick sessions)         │ │
│ │ 10-11 █ █ █ █ ▓ ▒ ░     │ • Afternoon 3-4 PM (Deep learning)      │ │
│ │ 11-12 ▓ ▓ ▓ ▓ ▒ ░ ░     │                                          │ │
│ │  1-2  ▓ █ ▓ █ ▓ ░ ░     │ Weekend Engagement: 32% of weekday      │ │
│ │  2-3  ▒ ▓ ▒ ▓ ▒ ░ ░     │ Friday Drop-off: -23% after 3 PM       │ │
│ │  3-4  ▓ █ ▓ █ ▒ ░ ░     │                                          │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🔄 Retention Cohorts                                                │ │
│ │                                                                     │ │
│ │ Week    Day 1   Day 7   Day 14  Day 30                             │ │
│ │ Oct 1   100%    72%     58%     41%                                │ │
│ │ Oct 8   100%    78%     62%     45%    ← Improving retention       │ │
│ │ Oct 15  100%    81%     65%     [pending]                          │ │
│ │ Oct 22  100%    83%     [pending]                                  │ │
│ │                                                                     │ │
│ │ Average 7-day retention: 78.5% (↑6% from last month)               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Trends] [Missions] [Players] [Predictions]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3. Mission Performance Over Time

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎯 Mission Analytics                    [Trending ▼] [Compare Periods]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Mission Popularity Trends (30 days)                              │ │
│ │                                                                     │ │
│ │ Plays                                                               │ │
│ │  50 ┤    Finance Basics ━━━━━  ╱────                             │ │
│ │  40 ┤    HR Onboarding ┅┅┅┅  ╱─╯                                │ │
│ │  30 ┤    Production 101 ····╱                                    │ │
│ │  20 ┤ ──────────────────╱───                                     │ │
│ │  10 ┤              ╱───╯                                         │ │
│ │   0 └────────────────────────────────────────                     │ │
│ │     Week 1    Week 2    Week 3    Week 4                           │ │
│ │                                                                     │ │
│ │ 🔥 Trending Up: Production (+45%)  📉 Declining: Marketing (-12%)   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 🎮 Difficulty Evolution  │ 📊 Success Rate Changes                  │ │
│ │                          │                                          │ │
│ │ Week 1: E:45% M:40% H:15%│ Mission Success Rates:                  │ │
│ │ Week 2: E:42% M:41% H:17%│ • Finance: 82% → 89% (↑7%)            │ │
│ │ Week 3: E:38% M:43% H:19%│ • HR: 79% → 83% (↑4%)                 │ │
│ │ Week 4: E:35% M:45% H:20%│ • Production: 65% → 71% (↑6%)         │ │
│ │                          │ • Marketing: 71% → 68% (↓3%)          │ │
│ │ Players progressing to   │                                          │ │
│ │ harder content ✓         │ Overall improvement trend ✓             │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 Optimal Learning Paths (Based on 30-day data)                    │ │
│ │                                                                     │ │
│ │ Most Successful Sequences:                      Completion Rate     │ │
│ │ 1. Finance → HR → Marketing → Production       87%                 │ │
│ │ 2. HR → Finance → Production → Marketing       83%                 │ │
│ │ 3. Production → Finance → HR → Marketing       79%                 │ │
│ │                                                                     │ │
│ │ Recommendation: Guide new players through Path 1 for best results  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Trends] [Missions] [Players] [Predictions]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. Player Behavior Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👥 Player Analytics                    [Segment: All ▼] [Time: 30d ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Player Progression Funnel (30-day cohort)                        │ │
│ │                                                                     │ │
│ │ Started        ████████████████████ 100% (247 players)             │ │
│ │ Level 2+       ████████████████░░░░  82% (202 players)             │ │
│ │ Level 5+       ██████████░░░░░░░░░░  51% (126 players)             │ │
│ │ Level 10+      ████░░░░░░░░░░░░░░░░  18% (45 players)              │ │
│ │ Level 15+      █░░░░░░░░░░░░░░░░░░░   5% (12 players)              │ │
│ │                                                                     │ │
│ │ Average time to Level 5: 12.3 days    Drop-off point: Level 7      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 🎯 Performance Trends    │ 🔥 Streak Patterns                       │ │
│ │                          │                                          │ │
│ │ Accuracy over time:      │ Streak Distribution Evolution:          │ │
│ │ Week 1: 65.2%           │ Week 1: Avg 2.1 days                   │ │
│ │ Week 2: 71.8% (↑6.6%)   │ Week 2: Avg 3.4 days                   │ │
│ │ Week 3: 76.4% (↑4.6%)   │ Week 3: Avg 4.2 days                   │ │
│ │ Week 4: 78.3% (↑1.9%)   │ Week 4: Avg 4.8 days                   │ │
│ │                          │                                          │ │
│ │ Learning curve plateaus  │ 23% maintain 7+ day streaks            │ │
│ │ after week 3 ✓          │ 8% achieve 14+ day streaks             │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🎮 Player Lifecycle Stages                                          │ │
│ │                                                                     │ │
│ │ Onboarding (Days 1-7):    45% complete first mission               │ │
│ │ Learning (Days 8-21):     Players try 3.2 categories avg           │ │
│ │ Mastery (Days 22-30):     Focus on 1-2 preferred categories        │ │
│ │ Expert (Days 31+):        89% accuracy, mentoring others           │ │
│ │                                                                     │ │
│ │ Churn Risk: 67% of churned players quit between days 8-14          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Trends] [Missions] [Players] [Predictions]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5. Predictive Analytics (90+ Days of Data)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔮 Predictive Analytics               [Confidence: High] [Recalculate]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 30-Day Projections                                               │ │
│ │                                                                     │ │
│ │ Metric              Current    Projected   Change   Confidence      │ │
│ │ ─────────────────────────────────────────────────────────────      │ │
│ │ Active Players      247        285         +15%     85%            │ │
│ │ Avg Level          3.4        4.1         +0.7     92%            │ │
│ │ Daily Sessions     89         112         +26%     78%            │ │
│ │ Completion Rate    76%        81%         +5pp     88%            │ │
│ │                                                                     │ │
│ │ Based on: Linear regression with seasonal adjustments               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 🎯 Churn Prediction      │ 📈 Growth Opportunities                  │ │
│ │                          │                                          │ │
│ │ High Risk Players: 23    │ Untapped Potential:                     │ │
│ │ • No play in 5+ days     │ • 45 players ready for Hard missions    │ │
│ │ • Accuracy < 50%         │ • 67 players stuck at Level 4-5         │ │
│ │ • Failed 3+ missions     │ • 112 casual → regular conversion       │ │
│ │                          │                                          │ │
│ │ Intervention Success:    │ If converted:                           │ │
│ │ 72% return if contacted  │ +34% mission completions                │ │
│ │ within 7 days           │ +2,400 points/week                      │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🎮 Optimal Content Recommendations                                  │ │
│ │                                                                     │ │
│ │ For High Performers:     Add 5 more Hard missions (Production)     │ │
│ │ For Regular Players:     Create Medium bridge content (Finance)    │ │
│ │ For Beginners:          Simplify onboarding, add tutorials         │ │
│ │                                                                     │ │
│ │ ROI Projection: 23% increase in engagement with these changes      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Trends] [Missions] [Players] [Predictions]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation Roadmap with Historical Data

### Phase 1 (Current - Limited Data)
- Basic counts and averages
- Current state snapshots
- Simple leaderboards
- Category breakdowns

### Phase 2 (30+ Days of Data)
- Trend lines and comparisons
- Week-over-week changes
- Retention cohorts
- Activity heatmaps
- Learning path analysis

### Phase 3 (90+ Days of Data)
- Predictive analytics
- Churn prediction models
- Optimal content recommendations
- Seasonal pattern detection
- A/B test results

### Required for Full Implementation:
1. **Daily snapshot job** to capture metrics
2. **Data retention policy** (keep raw data 6 months)
3. **Aggregation tables** for performance
4. **Machine learning pipeline** for predictions

All visualizations use only data from existing tables:
- `employee_game_progress`
- `game_sessions`
- `game_missions`
- `puzzle_progress`
- Time-series derived from `created_at`/`started_at` fields