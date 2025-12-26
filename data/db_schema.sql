CREATE TABLE token (
    id integer not null primary key autoincrement, 
    access_token text not null, 
    refresh_token text not null
);
CREATE TABLE sqlite_sequence(name,seq);
