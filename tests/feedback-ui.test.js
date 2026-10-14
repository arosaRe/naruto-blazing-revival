import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicFeedbackEndpoint, feedbackValidation, feedbackError} from '../feedback.js';
test('feedback: public HTTPS relay only, no webhook or credentials', () => {
  for (const url of ['', 'http://localhost:9102/feedback', 'https://discord.com/api/webhooks/123/token', 'https://discordapp.com/api/webhooks/123/token', 'https://relay.test/webhooks/token', 'https://user:pass@relay.test/feedback', 'https://relay.test/feedback?secret=x']) assert.equal(publicFeedbackEndpoint(url), '');
  assert.equal(publicFeedbackEndpoint('https://relay.example/feedback'), 'https://relay.example/feedback');
});
test('feedback: UTF-16, whitespace and control validation', () => {
  assert.ok(feedbackValidation(' \n\t'));
  assert.equal(feedbackValidation('😀'.repeat(900)), '');
  assert.ok(feedbackValidation('😀'.repeat(901)));
  assert.ok(feedbackValidation('a\u0000'));
  assert.equal(feedbackValidation('a\n\tb'), '');
  for (const code of [400,413,429,502,503]) assert.ok(feedbackError(code));
});
