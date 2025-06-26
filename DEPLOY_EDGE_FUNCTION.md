# Deploy Enhanced Position Skills Edge Function

To deploy the new `suggest-position-skills-enhanced` function to Supabase:

## 1. Deploy via Supabase CLI

```bash
supabase functions deploy suggest-position-skills-enhanced
```

## 2. Or Deploy via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** section
3. Click **Create New Function**
4. Name: `suggest-position-skills-enhanced`
5. Copy the entire contents of `/supabase/functions/suggest-position-skills-enhanced/index.ts`
6. Click **Deploy**

## 3. Verify Environment Variables

Make sure these are set in your Supabase project:
- `OPENAI_API_KEY` - Your OpenAI API key
- `SUPABASE_URL` - Already set by default
- `SUPABASE_SERVICE_ROLE_KEY` - Already set by default

## 4. Test the Function

The function will be automatically called when:
- Creating a new position and typing a description
- Clicking the "Refresh" button in the AI suggestions panel

The function combines:
- Real-time search of your skills taxonomy database
- AI-powered suggestions from OpenAI GPT-4
- Smart categorization of skills (essential/important/nice-to-have)
- Relevance scoring and ranking

## Features

- **Database Integration**: Searches your existing skills taxonomy
- **Contextual AI**: Uses position title, description, level, and department
- **Smart Categorization**: AI determines skill importance
- **De-duplication**: Prevents suggesting skills already in database
- **Proficiency Recommendations**: Suggests appropriate skill levels
- **Error Handling**: Graceful fallbacks if API fails

## Troubleshooting

If suggestions aren't working:
1. Check Edge Function logs in Supabase dashboard
2. Verify OpenAI API key is set correctly
3. Ensure the function is deployed and active
4. Check browser console for any errors