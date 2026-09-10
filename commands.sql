CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  url VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes)
VALUES
  ('Edsger W. Dijkstra', 'http://www.u.utexas.edu/users/EWD/transcriptions/EWD03xx/EWD340.html', 'Go To Statement Considered Harmful', 5),
  ('Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', 'Type Wars', 0);