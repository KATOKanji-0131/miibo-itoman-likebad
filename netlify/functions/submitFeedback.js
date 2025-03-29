const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
  console.log('📥 submitFeedback invoked');

  try {
    const { message, rating } = JSON.parse(event.body);
    console.log('📝 message:', message);
    console.log('⭐ rating:', rating);

    const { data, error } = await supabase.from('feedbacks').insert([
      { message, rating }
    ]);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    console.log('✅ Supabase insert success:', data);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('❗ JSON parse or other error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};
