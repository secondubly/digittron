BEGIN
  CREATE TABLE IF NOT EXISTS `token` (`id` integer not null primary key autoincrement, `twitch_access_token` text not null, `spotify_access_token` text null);
  INSERT INTO token (id, twitch_access_token, spotify_access_token) VALUES
  (123, '{twitch_access_token_here}', null), -- id value should be twitch user id, spotify access token is optional
  (321, '{twitch_access_token}', null); -- id should be bot user id
END