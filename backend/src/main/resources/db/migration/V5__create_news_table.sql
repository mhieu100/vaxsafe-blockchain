-- Create news table for health and vaccine news
CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    short_description VARCHAR(1000),
    content TEXT,
    thumbnail_image VARCHAR(500),
    cover_image VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    author VARCHAR(200),
    view_count BIGINT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    tags VARCHAR(500),
    source VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_deleted ON news(is_deleted);
CREATE INDEX IF NOT EXISTS idx_news_category_published ON news(category, is_published, published_at DESC) WHERE is_deleted = FALSE;

-- Add comments for documentation
COMMENT ON TABLE news IS 'News articles about health and vaccines';
COMMENT ON COLUMN news.slug IS 'URL-friendly identifier for the news article';
COMMENT ON COLUMN news.title IS 'Title of the news article';
COMMENT ON COLUMN news.short_description IS 'Brief summary of the article';
COMMENT ON COLUMN news.content IS 'Full content of the article (HTML or Markdown)';
COMMENT ON COLUMN news.thumbnail_image IS 'Small image for list views';
COMMENT ON COLUMN news.cover_image IS 'Large cover image for article detail';
COMMENT ON COLUMN news.category IS 'Category: HEALTH_GENERAL, VACCINE_INFO, DISEASE_PREVENTION, etc.';
COMMENT ON COLUMN news.author IS 'Author name';
COMMENT ON COLUMN news.view_count IS 'Number of times the article has been viewed';
COMMENT ON COLUMN news.is_featured IS 'Whether to feature this article on homepage';
COMMENT ON COLUMN news.is_published IS 'Whether the article is publicly visible';
COMMENT ON COLUMN news.published_at IS 'When the article was published';
COMMENT ON COLUMN news.tags IS 'Comma-separated tags for categorization and search';
COMMENT ON COLUMN news.source IS 'Source of the news article';
COMMENT ON COLUMN news.created_at IS 'When the article was created';
COMMENT ON COLUMN news.updated_at IS 'When the article was last updated';
COMMENT ON COLUMN news.is_deleted IS 'Soft delete flag';
