# Analytics Dashboard Wireframes

## 1. Analytics Overview Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎮 Gamification Analytics                               [Date Range ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┬─────────────────┬─────────────────┬──────────────┐ │
│ │ Active Players  │ Avg Accuracy    │ Total Points    │ Engagement   │ │
│ │                 │                 │                 │ Rate         │ │
│ │    247         │    78.3%       │   125,420      │   64%       │ │
│ │    ↑ 12%       │    ↑ 3.2%      │    ↑ 8,340     │   ↓ 2%      │ │
│ └─────────────────┴─────────────────┴─────────────────┴──────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────┬───────────────────────────────────┐ │
│ │ 📈 Daily Active Users (30 days) │ 🎯 Mission Completion Rate       │ │
│ │                                 │                                   │ │
│ │  250 ┤ ╭─╮                     │ Easy    ████████████ 92%         │ │
│ │  200 ┤╭╯ ╰╮  ╭─╮              │ Medium  ████████░░░░ 67%         │ │
│ │  150 ┤╯   ╰──╯ ╰╮             │ Hard    █████░░░░░░░ 41%         │ │
│ │  100 ┤          ╰─            │                                   │ │
│ │      └──────────────────       │ Avg Session: 12.4 mins           │ │
│ └─────────────────────────────────┴───────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏆 Top Performers This Week                          [View All →]   │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 1. Sarah Chen        Level 15    2,340 pts    15-day streak 🔥     │ │
│ │ 2. Mike Johnson      Level 14    2,180 pts     8-day streak 🔥     │ │
│ │ 3. Emma Wilson       Level 13    2,010 pts     3-day streak 🔥     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Player Performance Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Player Performance                        [Filter: All] [Export CSV]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────┬───────────────────────────────────┐ │
│ │ 📈 Performance Distribution     │ 🎯 Accuracy by Difficulty         │ │
│ │                                 │                                   │ │
│ │   40 ┤ ████                    │ 100% ┤      ╭─────               │ │
│ │   30 ┤ ████ ████               │  75% ┤ ╭────╯                    │ │
│ │   20 ┤ ████ ████ ████          │  50% ┤─╯                         │ │
│ │   10 ┤ ████ ████ ████ ██       │  25% ┤                           │ │
│ │    0 └──────────────────       │   0% └───────────────────        │ │
│ │       0-25 26-50 51-75 76-100  │       Easy  Medium  Hard          │ │
│ │       Points (hundreds)         │                                   │ │
│ └─────────────────────────────────┴───────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Player Segments                                                     │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 🌟 High Performers (>80% accuracy, >10 missions/week)      45 (18%) │ │
│ │ 📈 Regular Players (50-80% accuracy, 5-10 missions/week)  112 (45%) │ │
│ │ 🌱 Beginners (<50% accuracy, <5 missions/week)            90 (37%) │ │
│ │                                                                     │ │
│ │ ┌─ Retention Risk Alert ────────────────────────────────────────┐  │ │
│ │ │ ⚠️  23 players haven't played in 7+ days                      │  │ │
│ │ │ 🔴  8 players showing declining performance                   │  │ │
│ │ └────────────────────────────────────────────────────[View →]──┘  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Engagement Trends

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📅 Engagement Trends                    [1W] [1M] [3M] [6M] [1Y] [All]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Multi-Metric Timeline                              [Toggle ▼]    │ │
│ │                                                                     │ │
│ │ 300 ┤ ╭─╮     Sessions ━━━━                                      │ │
│ │ 250 ┤╭╯ ╰╮    Active Users ┅┅┅┅                                  │ │
│ │ 200 ┤┅┅ ┅╰┅╮  Completions ····                                    │ │
│ │ 150 ┤  ╰──╯╰╮                                                     │ │
│ │ 100 ┤ ······╰─····                                                │ │
│ │  50 ┤                                                             │ │
│ │   0 └─────────────────────────────────────────────────────       │ │
│ │     Mon   Tue   Wed   Thu   Fri   Sat   Sun                       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ ⏰ Peak Activity Hours   │ 📆 Day of Week Patterns                  │ │
│ │                          │                                          │ │
│ │ 9am  ██████░░░░ 32%     │ Mon ████████████ 89 sessions            │ │
│ │ 10am ████████░░ 41%     │ Tue ███████████░ 82 sessions            │ │
│ │ 11am ████████░░ 38%     │ Wed ████████████ 91 sessions            │ │
│ │ 2pm  ██████████ 52%     │ Thu ██████████░░ 78 sessions            │ │
│ │ 3pm  ████████░░ 43%     │ Fri ████████░░░░ 65 sessions            │ │
│ │ 4pm  ██████░░░░ 31%     │ Sat ████░░░░░░░░ 32 sessions            │ │
│ │                          │ Sun ███░░░░░░░░░ 28 sessions            │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🔥 Streak Analysis              Current Streaks Distribution        │ │
│ │ Average: 4.2 days               0 days  ████████ 32%               │ │
│ │ Longest: 47 days                1-3     ██████░░ 28%               │ │
│ │ Active streaks: 142             4-7     ████░░░░ 18%               │ │
│ │                                 8-14    ███░░░░░ 14%               │ │
│ │                                 15+     ██░░░░░░  8%               │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Content Effectiveness

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📚 Content Effectiveness                               [Sort: Popular ▼] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Mission Performance Matrix                                          │ │
│ ├────────────────────────┬──────┬──────┬───────┬──────┬─────────────┤ │
│ │ Mission Title          │Plays │Compl%│Accur% │Time  │Effectiveness│ │
│ ├────────────────────────┼──────┼──────┼───────┼──────┼─────────────┤ │
│ │ Finance Basics 101     │ 342  │ 89%  │ 82%   │ 8.2m │ ████████ 88 │ │
│ │ Marketing Strategies   │ 298  │ 76%  │ 71%   │12.1m │ ██████░░ 72 │ │
│ │ HR Best Practices      │ 276  │ 91%  │ 79%   │ 9.4m │ ███████░ 85 │ │
│ │ Production Planning    │ 234  │ 68%  │ 65%   │14.3m │ █████░░░ 61 │ │
│ │ Leadership Skills      │ 198  │ 82%  │ 88%   │10.2m │ ████████ 87 │ │
│ │ Data Analysis Intro    │ 156  │ 54%  │ 61%   │16.7m │ ████░░░░ 52 │ │
│ └────────────────────────┴──────┴──────┴───────┴──────┴─────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 📊 Category Performance  │ 🎮 Difficulty Balance                    │ │
│ │                          │                                          │ │
│ │ Finance    ███████░ 78% │ Perfect distribution:                    │ │
│ │ Marketing  ██████░░ 71% │ Easy    40% ████░░░░ (actual: 45%)      │ │
│ │ HR         ████████ 85% │ Medium  40% ████░░░░ (actual: 38%)      │ │
│ │ Production █████░░░ 64% │ Hard    20% ██░░░░░░ (actual: 17%)      │ │
│ │ General    ██████░░ 72% │                                          │ │
│ │                          │ ⚠️ Consider adding more hard missions    │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 Content Insights                                                 │ │
│ │ • Missions >15 mins have 23% lower completion rate                 │ │
│ │ • Finance category shows highest engagement (342 avg plays)        │ │
│ │ • Players prefer morning sessions for difficult content            │ │
│ │ • 67% of abandoned missions are retry within 48 hours              │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5. Skills Progression

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🎯 Skills Development                          [View: Organization-wide] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Organization Skill Radar                    Top Growing Skills      │ │
│ │                                                                     │ │
│ │         Leadership                          1. Data Analysis ↑32%   │ │
│ │             85                              2. Communication ↑28%   │ │
│ │      ╱────────╲                            3. Project Mgmt  ↑24%   │ │
│ │  Tech │        │ Finance                   4. Leadership    ↑21%   │ │
│ │   72  │   ●    │  78                       5. Problem Solv. ↑19%   │ │
│ │       │ ╱   ╲  │                                                   │ │
│ │       ╱─────────╲                          Skills at Risk:         │ │
│ │   Marketing   HR                           • Negotiation   ↓12%    │ │
│ │      68      81                            • Time Mgmt     ↓8%     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Skill Development Timeline                      [Filter Skills ▼]   │ │
│ │                                                                     │ │
│ │ 100 ┤ Leadership ━━━━━  ╭────────────                            │ │
│ │  80 ┤ Analytics ┅┅┅┅┅  ╭╯                                        │ │
│ │  60 ┤ Comm. ········ ╭─╯                                         │ │
│ │  40 ┤──────────────╯                                             │ │
│ │  20 ┤                                                            │ │
│ │   0 └────────────────────────────────────────────────           │ │
│ │     Jan   Feb   Mar   Apr   May   Jun                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🧩 Puzzle Progress Overview                                         │ │
│ │                                                                     │ │
│ │ Finance    [████████░░] 82% complete    Marketing [██████░░░░] 61% │ │
│ │ HR         [███████░░░] 74% complete    Production[█████░░░░░] 53% │ │
│ │                                                                     │ │
│ │ Average pieces unlocked: 127/200                                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6. Team Insights (Department/Company View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👥 Team Insights                         [Group by: Department ▼]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Department Comparison                                               │ │
│ ├─────────────────┬──────┬────────┬────────┬────────┬───────────────┤ │
│ │ Department      │Users │Avg Pts │Avg Acc │Engaged │Top Performer  │ │
│ ├─────────────────┼──────┼────────┼────────┼────────┼───────────────┤ │
│ │ 💼 Sales        │  45  │ 1,240  │  76%   │  82%   │ Sarah Chen    │ │
│ │ 🔧 Engineering  │  38  │ 1,380  │  81%   │  79%   │ Alex Kumar    │ │
│ │ 📊 Marketing    │  32  │ 1,180  │  73%   │  88%   │ Emma Wilson   │ │
│ │ 👥 HR           │  28  │ 1,090  │  79%   │  71%   │ Mike Johnson  │ │
│ │ 💰 Finance      │  24  │ 1,310  │  84%   │  75%   │ Lisa Zhang    │ │
│ └─────────────────┴──────┴────────┴────────┴────────┴───────────────┘ │
│                                                                         │
│ ┌──────────────────────────┬──────────────────────────────────────────┐ │
│ │ 📈 Team Progress Trends  │ 🎯 Focus Areas by Department             │ │
│ │                          │                                          │ │
│ │ Engagement Rate          │ Sales:      Communication, Negotiation   │ │
│ │ 100% ┤    ╱╲            │ Engineering: Problem Solving, Analytics  │ │
│ │  80% ┤───╱──╲──         │ Marketing:  Creativity, Data Analysis    │ │
│ │  60% ┤  ╱    ╲         │ HR:         Leadership, Compliance       │ │
│ │  40% ┤ ╱      ╲        │ Finance:    Analytics, Risk Management   │ │
│ │      └──────────        │                                          │ │
│ │      W1 W2 W3 W4        │ 💡 Marketing shows highest engagement    │ │
│ └──────────────────────────┴──────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏆 Leaderboard Settings                          [Configure →]      │ │
│ │                                                                     │ │
│ │ ☑️ Show individual rankings within teams                            │ │
│ │ ☑️ Display team averages                                            │ │
│ │ ☐ Enable cross-team challenges                                      │ │
│ │ ☑️ Weekly achievement highlights                                    │ │
│ │                                                                     │ │
│ │ Next milestone: Sales team 50 collective missions away from Gold    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Overview] [Performance] [Engagement] [Content] [Skills] [Teams]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Design Principles Applied

1. **Progressive Disclosure**: Start with high-level metrics, allow drilling down
2. **Visual Hierarchy**: Most important metrics are prominent, use size/color
3. **Contextual Insights**: Actionable alerts and recommendations
4. **Comparison & Benchmarking**: Show relative performance
5. **Time-based Analysis**: Multiple time range options
6. **Segmentation**: Group by various dimensions (dept, skill, level)
7. **Mixed Chart Types**: Use appropriate visualization for each data type
8. **White Space**: Prevent cognitive overload with proper spacing
9. **Color Psychology**: 
   - Green = positive/growth
   - Red = attention needed
   - Blue = neutral information
   - Orange = warnings
10. **Mobile Consideration**: Tabs for easy navigation on smaller screens