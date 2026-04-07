import scrapy

class SchemeItem(scrapy.Item):
    scheme_id = scrapy.Field()
    name = scrapy.Field()
    description = scrapy.Field()
    eligibility = scrapy.Field()
    benefits = scrapy.Field()
    application_steps = scrapy.Field()
    
    # Enhanced Tags for Organization
    location_tags = scrapy.Field()
    industry_tags = scrapy.Field()
    target_audience_tags = scrapy.Field()
    category_tags = scrapy.Field()
    
    date_of_scheme_launch = scrapy.Field()
    source_url = scrapy.Field()
    
    # Temporary field for the pipeline to process
    raw_text = scrapy.Field()
