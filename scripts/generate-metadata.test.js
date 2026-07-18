// scripts/generate-metadata.test.js
const assert = require('assert').strict;
const { extractTagsFromMarkdown, checkPreviewExists } = require('./generate-metadata.js');

console.log('🧪 Starting metadata utility tests...');

// Test 1: extractTagsFromMarkdown
try {
    const md = 'Here is a badge https://img.shields.io/badge/python-blue?logo=python and some react code.';
    const tags = extractTagsFromMarkdown(md);
    
    assert.ok(tags.includes('python'), 'Should extract python tag from badge URL');
    assert.ok(tags.includes('react'), 'Should extract react keyword tag from content');
    console.log('✅ extractTagsFromMarkdown tests passed!');
} catch (error) {
    console.error('❌ extractTagsFromMarkdown tests failed:');
    console.error(error);
    process.exit(1);
}

// Test 2: checkPreviewExists
try {
    // We know this preview doesn't exist
    const fakePreview = checkPreviewExists('nonexistent_user_abc123', 'minimalistic');
    assert.strictEqual(fakePreview, false, 'Should return false for nonexistent preview');
    
    console.log('✅ checkPreviewExists tests passed!');
} catch (error) {
    console.error('❌ checkPreviewExists tests failed:');
    console.error(error);
    process.exit(1);
}

console.log('🎉 All tests passed successfully!');
