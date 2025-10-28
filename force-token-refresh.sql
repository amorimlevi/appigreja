-- Delete old APNs tokens to force re-registration
-- Users will get new FCM tokens on next app open

DELETE FROM device_tokens
WHERE platform = 'ios'
  AND bundle_id = 'com.igreja.member'
  AND LENGTH(token) = 64; -- Only delete APNs tokens (64 chars)

-- Verify remaining tokens
SELECT 
    member_id,
    platform,
    bundle_id,
    LENGTH(token) as token_length,
    created_at
FROM device_tokens
WHERE platform = 'ios'
  AND bundle_id = 'com.igreja.member'
ORDER BY created_at DESC;
