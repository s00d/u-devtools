import { z } from 'zod';

// ========== Validation Helper Functions ==========

function isValidUrl(url: string): boolean {
  // Check for dangerous protocols
  if (
    url.toLowerCase().startsWith('javascript:') ||
    url.toLowerCase().startsWith('data:') ||
    url.toLowerCase().startsWith('vbscript:')
  ) {
    return false;
  }
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime());
}

function isValidDuration(duration: string): boolean {
  return /^P(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?|(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?)$/.test(
    duration
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ========== Custom Zod Validators ==========

const urlSchema = z.string().refine(isValidUrl, {
  message: 'Must be a valid HTTP/HTTPS URL',
});

const emailSchema = z.string().refine(isValidEmail, {
  message: 'Must be a valid email address',
});

const dateSchema = z.string().refine(isValidDate, {
  message: 'Must be a valid date string',
});

const durationSchema = z.string().refine(isValidDuration, {
  message: 'Must be a valid ISO 8601 duration (e.g., PT5M, PT1H30M)',
});

const safeUrlSchema = z
  .string()
  .refine(
    (val) =>
      !val.toLowerCase().startsWith('javascript:') &&
      !val.toLowerCase().startsWith('data:') &&
      !val.toLowerCase().startsWith('vbscript:'),
    { message: 'URL contains unsafe protocol (javascript:, data:, vbscript:)' }
  )
  .refine(isValidUrl, { message: 'Must be a valid HTTP/HTTPS URL' });

// ========== Base Schemas ==========

const BaseSchema = z
  .object({
    '@context': z.literal('https://schema.org'),
    '@type': z.string(),
  })
  .passthrough(); // Allow additional fields

// ========== Nested Schemas ==========

const ImageObjectSchema = z
  .object({
    '@type': z.literal('ImageObject').optional(),
    url: urlSchema,
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .passthrough();

const OfferSchema = z
  .object({
    '@type': z.literal('Offer').optional(),
    price: z.union([z.number(), z.string()]),
    priceCurrency: z.string(),
    availability: z.string().optional(),
    url: urlSchema.optional(),
  })
  .passthrough()
  .refine((data) => !data.availability || data.availability.startsWith('https://schema.org/'), {
    message: 'availability should be a schema.org URL',
    path: ['availability'],
  });

const AggregateRatingSchema = z
  .object({
    '@type': z.literal('AggregateRating').optional(),
    ratingValue: z.number(),
    reviewCount: z.number().min(0),
    bestRating: z.number().optional(),
    worstRating: z.number().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (
      data.ratingValue !== undefined &&
      data.bestRating !== undefined &&
      data.worstRating !== undefined
    ) {
      if (data.ratingValue < data.worstRating || data.ratingValue > data.bestRating) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `ratingValue (${data.ratingValue}) must be between worstRating (${data.worstRating}) and bestRating (${data.bestRating})`,
          path: ['ratingValue'],
        });
      }
    }
  });

const PostalAddressSchema = z
  .object({
    '@type': z.literal('PostalAddress').optional(),
    streetAddress: z.string().nullable().optional(),
    addressLocality: z.string().optional(),
    postalCode: z.union([z.string(), z.number()]).optional(),
    addressCountry: z.string().optional(),
  })
  .passthrough();

const GeoCoordinatesSchema = z
  .object({
    '@type': z.literal('GeoCoordinates').optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .passthrough();

const ListItemSchema = z
  .object({
    '@type': z.literal('ListItem'),
    position: z.number(),
    name: z.string(),
    item: z.string().optional(),
  })
  .passthrough();

const QuestionSchema = z
  .object({
    '@type': z.literal('Question'),
    name: z.string().optional(),
    question: z.string().optional(),
    acceptedAnswer: z
      .object({
        '@type': z.literal('Answer'),
        text: z.string(),
      })
      .passthrough(),
  })
  .passthrough()
  .refine((data) => data.name || data.question, {
    message: 'Question must have "name" or "question"',
    path: ['name'],
  });

const HowToStepSchema = z
  .object({
    '@type': z.literal('HowToStep'),
    name: z.string(),
    text: z.string().nullable().optional(),
  })
  .passthrough();

// ========== Schema.org Type Schemas ==========

const ProductSchema = BaseSchema.extend({
  '@type': z.literal('Product'),
  name: z.string().min(1, 'Product missing "name"'),
  description: z.string().optional(),
  offers: OfferSchema.optional(),
  aggregateRating: AggregateRatingSchema.optional(),
  image: z
    .union([urlSchema, ImageObjectSchema, z.array(z.union([urlSchema, ImageObjectSchema]))])
    .optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.offers && !data.aggregateRating) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Product missing "offers" or "aggregateRating" (Rich Snippet requires one)',
        path: ['offers'],
      });
    }
    if (!data.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Product missing "description" (recommended)',
        path: ['description'],
        fatal: false,
      });
    }
  });

const ArticleSchema = BaseSchema.extend({
  '@type': z.union([z.literal('Article'), z.literal('NewsArticle'), z.literal('BlogPosting')]),
  headline: z.string().min(1, 'Article missing "headline"'),
  image: z
    .union([urlSchema, ImageObjectSchema, z.array(z.union([urlSchema, ImageObjectSchema]))])
    .optional(),
  datePublished: dateSchema.optional(),
  author: z.any().optional(),
  publisher: z.any().optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Article missing "image" (Required for Google Discover)',
        path: ['image'],
        fatal: false,
      });
    }
    if (!data.datePublished) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Article missing "datePublished"',
        path: ['datePublished'],
        fatal: false,
      });
    }
    if (!data.author) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Article missing "author"',
        path: ['author'],
        fatal: false,
      });
    }
    if (!data.publisher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Article missing "publisher"',
        path: ['publisher'],
        fatal: false,
      });
    }
  });

const BreadcrumbListSchema = BaseSchema.extend({
  '@type': z.literal('BreadcrumbList'),
  itemListElement: z.array(ListItemSchema).min(1, 'BreadcrumbList missing "itemListElement"'),
})
  .passthrough()
  .superRefine((data, ctx) => {
    data.itemListElement.forEach((item, idx) => {
      if (item.item && !isValidUrl(item.item)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `BreadcrumbList item ${idx + 1} has invalid URL: "${item.item}"`,
          path: ['itemListElement', idx, 'item'],
          fatal: false,
        });
      }
    });
  });

const OrganizationSchema = BaseSchema.extend({
  '@type': z.literal('Organization'),
  name: z.string().optional(),
  url: safeUrlSchema.optional(),
  logo: z.union([urlSchema, ImageObjectSchema]).nullable().optional(),
  sameAs: z.array(safeUrlSchema).optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.logo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization recommended to have "logo"',
        path: ['logo'],
        fatal: false,
      });
    }
    if (!data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization recommended to have "url"',
        path: ['url'],
        fatal: false,
      });
    }
    if (data.logo === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization "logo" is null (should be a string or ImageObject)',
        path: ['logo'],
        fatal: false,
      });
    }
  });

const FAQPageSchema = BaseSchema.extend({
  '@type': z.literal('FAQPage'),
  mainEntity: z.array(QuestionSchema).min(1, 'FAQPage missing "mainEntity"'),
}).passthrough();

const LocalBusinessSchema = BaseSchema.extend({
  '@type': z.literal('LocalBusiness'),
  name: z.string().optional(),
  address: PostalAddressSchema.optional(),
  geo: GeoCoordinatesSchema.optional(),
  priceRange: z.string().optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.geo && typeof data.geo === 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'LocalBusiness "geo" must be a GeoCoordinates object, not a string',
        path: ['geo'],
      });
    }
    if (data.priceRange && typeof data.priceRange !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'LocalBusiness "priceRange" must be a string (e.g., "$", "$$", "$$$")',
        path: ['priceRange'],
      });
    }
  });

const EventSchema = BaseSchema.extend({
  '@type': z.literal('Event'),
  name: z.string().min(1, 'Event missing "name"'),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  eventStatus: z.string().optional(),
  location: z.any().optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.eventStatus && !data.eventStatus.startsWith('https://schema.org/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Event "eventStatus" should be a schema.org URL: "${data.eventStatus}"`,
        path: ['eventStatus'],
        fatal: false,
      });
    }
    if (data.location && !data.location.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Event "location" missing "address"',
        path: ['location'],
        fatal: false,
      });
    }
  });

const HowToSchema = BaseSchema.extend({
  '@type': z.literal('HowTo'),
  name: z.string().min(1, 'HowTo missing "name"'),
  description: z.string().optional(),
  step: z.array(HowToStepSchema).min(1, 'HowTo missing "step"'),
  totalTime: durationSchema.optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'HowTo missing "description" (recommended)',
        path: ['description'],
        fatal: false,
      });
    }
    data.step.forEach((step, idx) => {
      if (step.text === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `HowTo step ${idx + 1} "text" is null (should be a string)`,
          path: ['step', idx, 'text'],
          fatal: false,
        });
      }
    });
  });

const RecipeSchema = BaseSchema.extend({
  '@type': z.literal('Recipe'),
  name: z.string().min(1, 'Recipe missing "name"'),
  recipeIngredient: z.array(z.string()).optional(),
  recipeInstructions: z.any().optional(),
  cookTime: durationSchema.optional(),
  prepTime: z.union([durationSchema, z.boolean()]).optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.recipeInstructions && typeof data.recipeInstructions === 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recipe "recipeInstructions" should be an array or ItemList, not a string',
        path: ['recipeInstructions'],
      });
    }
    if (data.recipeIngredient) {
      data.recipeIngredient.forEach((ing, idx) => {
        if (typeof ing !== 'string' && ing !== null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Recipe ingredient ${idx + 1} should be a string, got: ${typeof ing}`,
            path: ['recipeIngredient', idx],
            fatal: false,
          });
        }
      });
    }
  });

const ReviewSchema = BaseSchema.extend({
  '@type': z.literal('Review'),
  itemReviewed: z.any(),
  reviewRating: z
    .object({
      '@type': z.literal('Rating').optional(),
      ratingValue: z.union([z.number(), z.string()]),
      bestRating: z.union([z.number(), z.string()]).optional(),
      worstRating: z.union([z.number(), z.string()]).optional(),
    })
    .passthrough()
    .optional(),
  reviewBody: z.string().optional(),
}).passthrough();

const VideoObjectSchema = BaseSchema.extend({
  '@type': z.literal('VideoObject'),
  name: z.string().min(1, 'VideoObject missing "name"'),
  uploadDate: dateSchema.optional(),
  duration: durationSchema.optional(),
  thumbnailUrl: urlSchema.optional(),
  contentUrl: urlSchema.optional(),
  embedUrl: urlSchema.optional(),
}).passthrough();

const CourseSchema = BaseSchema.extend({
  '@type': z.literal('Course'),
  name: z.string().min(1, 'Course missing "name"'),
  provider: z.any(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.provider && typeof data.provider === 'object' && !data.provider['@type']) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Course "provider" should have "@type" (Organization)',
        path: ['provider'],
        fatal: false,
      });
    }
  });

const WebSiteSchema = BaseSchema.extend({
  '@type': z.literal('WebSite'),
  name: z.string().min(1, 'WebSite missing "name"'),
  url: safeUrlSchema.optional(),
  potentialAction: z
    .object({
      '@type': z.literal('SearchAction'),
      target: z.string(),
      'query-input': z.string().optional(),
    })
    .passthrough()
    .optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WebSite missing "url"',
        path: ['url'],
        fatal: false,
      });
    }
    if (data.potentialAction) {
      if (data.potentialAction.target && !isValidUrl(data.potentialAction.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `WebSite "potentialAction.target" is not a valid URL: "${data.potentialAction.target}"`,
          path: ['potentialAction', 'target'],
          fatal: false,
        });
      }
    }
  });

const SoftwareApplicationSchema = BaseSchema.extend({
  '@type': z.literal('SoftwareApplication'),
  name: z.string().min(1, 'SoftwareApplication missing "name"'),
  applicationCategory: z.string().optional(),
  operatingSystem: z.union([z.string(), z.array(z.string())]).optional(),
  offers: OfferSchema.optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.applicationCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SoftwareApplication missing "applicationCategory"',
        path: ['applicationCategory'],
        fatal: false,
      });
    }
    if (data.offers) {
      if (!data.offers.priceCurrency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SoftwareApplication "offers" missing "priceCurrency"',
          path: ['offers', 'priceCurrency'],
          fatal: false,
        });
      }
    }
  });

const PersonSchema = BaseSchema.extend({
  '@type': z.literal('Person'),
  name: z.string().min(1, 'Person missing "name"'),
  email: emailSchema.optional(),
  url: safeUrlSchema.optional(),
  sameAs: z.array(safeUrlSchema).optional(),
}).passthrough();

const TechArticleSchema = BaseSchema.extend({
  '@type': z.literal('TechArticle'),
  headline: z.string().min(1, 'TechArticle missing "headline"'),
  datePublished: dateSchema.optional(),
  author: z.any().optional(),
  publisher: z.any().optional(),
  proficiencyLevel: z.string().optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.datePublished) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TechArticle missing "datePublished"',
        path: ['datePublished'],
        fatal: false,
      });
    }
    if (!data.author) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TechArticle missing "author"',
        path: ['author'],
        fatal: false,
      });
    }
    if (!data.publisher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TechArticle missing "publisher"',
        path: ['publisher'],
        fatal: false,
      });
    }
    if (data.proficiencyLevel && typeof data.proficiencyLevel !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TechArticle "proficiencyLevel" should be a string',
        path: ['proficiencyLevel'],
        fatal: false,
      });
    }
  });

const ContactPointSchema = BaseSchema.extend({
  '@type': z.literal('ContactPoint'),
  contactType: z.string().min(1, 'ContactPoint missing "contactType"'),
  email: emailSchema.optional(),
  telephone: z.string().optional(),
}).passthrough();

const ImageObjectSchemaFull = BaseSchema.extend({
  '@type': z.literal('ImageObject'),
  url: urlSchema,
  width: z.number().optional(),
  height: z.number().optional(),
}).passthrough();

const OfferSchemaFull = BaseSchema.extend({
  '@type': z.literal('Offer'),
  price: z.union([z.number(), z.string()]),
  priceCurrency: z.string(),
  availability: z.string().optional(),
  url: urlSchema.optional(),
})
  .passthrough()
  .refine((data) => !data.availability || data.availability.startsWith('https://schema.org/'), {
    message: 'availability should be a schema.org URL',
    path: ['availability'],
  });

const AggregateRatingSchemaFull = BaseSchema.extend({
  '@type': z.literal('AggregateRating'),
  ratingValue: z.number(),
  reviewCount: z.number().min(0).optional(),
  bestRating: z.number().optional(),
  worstRating: z.number().optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (
      data.ratingValue !== undefined &&
      data.bestRating !== undefined &&
      data.worstRating !== undefined
    ) {
      if (data.ratingValue < data.worstRating || data.ratingValue > data.bestRating) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `ratingValue (${data.ratingValue}) must be between worstRating (${data.worstRating}) and bestRating (${data.bestRating})`,
          path: ['ratingValue'],
        });
      }
    }
  });

const PostalAddressSchemaFull = BaseSchema.extend({
  '@type': z.literal('PostalAddress'),
  streetAddress: z.string().nullable().optional(),
  addressLocality: z.string().optional(),
  postalCode: z.union([z.string(), z.number()]).optional(),
  addressCountry: z.string().optional(),
}).passthrough();

const GeoCoordinatesSchemaFull = BaseSchema.extend({
  '@type': z.literal('GeoCoordinates'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).passthrough();

const PlaceSchema = BaseSchema.extend({
  '@type': z.literal('Place'),
  name: z.string().optional(),
  address: PostalAddressSchema.optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (!data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Place missing "name"',
        path: ['name'],
        fatal: false,
      });
    }
    if (!data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Place missing "address"',
        path: ['address'],
        fatal: false,
      });
    }
  });

const VirtualLocationSchema = BaseSchema.extend({
  '@type': z.literal('VirtualLocation'),
  name: z.string().optional(),
  url: safeUrlSchema,
}).passthrough();

const BrandSchema = BaseSchema.extend({
  '@type': z.literal('Brand'),
  name: z.string().min(1, 'Brand missing "name"'),
  logo: z.union([urlSchema, ImageObjectSchema]).optional(),
})
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.logo) {
      const isValid =
        typeof data.logo === 'string'
          ? isValidUrl(data.logo)
          : data.logo['@type'] === 'ImageObject' && data.logo.url && isValidUrl(data.logo.url);
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Brand "logo" should be a valid URL or ImageObject',
          path: ['logo'],
          fatal: false,
        });
      }
    }
  });

const RatingSchema = BaseSchema.extend({
  '@type': z.literal('Rating'),
  ratingValue: z.union([z.number(), z.string()]),
  bestRating: z.union([z.number(), z.string()]).optional(),
  worstRating: z.union([z.number(), z.string()]).optional(),
}).passthrough();

const ItemListSchema = BaseSchema.extend({
  '@type': z.literal('ItemList'),
  itemListElement: z.array(z.any()).min(1, 'ItemList missing "itemListElement"'),
  numberOfItems: z.number().optional(),
}).passthrough();

// ========== Common Validations ==========

function validateCommonFields(json: any, errors: string[], warnings: string[]): void {
  // Check for empty strings in important fields
  const importantStringFields = ['name', 'headline', 'title', 'description'];
  importantStringFields.forEach((field) => {
    if (
      json[field] !== undefined &&
      typeof json[field] === 'string' &&
      json[field].trim().length === 0
    ) {
      warnings.push(`"${field}" is an empty string`);
    }
  });

  // Check for invalid URLs in fields that should be URLs
  const urlFields = ['url', 'image', 'logo', 'thumbnailUrl', 'contentUrl', 'embedUrl'];
  urlFields.forEach((field) => {
    if (json[field] !== undefined) {
      if (typeof json[field] === 'string' && !isValidUrl(json[field])) {
        errors.push(`"${field}" is not a valid URL: "${json[field]}"`);
      } else if (Array.isArray(json[field])) {
        json[field].forEach((url: any, idx: number) => {
          if (typeof url === 'string' && !isValidUrl(url)) {
            errors.push(`"${field}[${idx}]" is not a valid URL: "${url}"`);
          }
        });
      }
    }
  });

  // Check for invalid dates
  const dateFields = [
    'datePublished',
    'dateModified',
    'startDate',
    'endDate',
    'uploadDate',
    'dateCreated',
  ];
  dateFields.forEach((field) => {
    if (json[field] !== undefined && typeof json[field] === 'string' && !isValidDate(json[field])) {
      errors.push(`"${field}" is not a valid date: "${json[field]}"`);
    }
  });

  // Check for invalid duration
  const durationFields = ['duration', 'cookTime', 'prepTime', 'totalTime'];
  durationFields.forEach((field) => {
    if (
      json[field] !== undefined &&
      typeof json[field] === 'string' &&
      !isValidDuration(json[field])
    ) {
      errors.push(`"${field}" is not a valid ISO 8601 duration: "${json[field]}"`);
    }
  });

  // Check for invalid email
  const emailFields = ['email'];
  emailFields.forEach((field) => {
    if (
      json[field] !== undefined &&
      typeof json[field] === 'string' &&
      !isValidEmail(json[field])
    ) {
      errors.push(`"${field}" is not a valid email: "${json[field]}"`);
    }
  });

  // Check for image arrays
  if (json.image && Array.isArray(json.image)) {
    json.image.forEach((img: any, idx: number) => {
      if (typeof img === 'string' && !isValidUrl(img)) {
        errors.push(`"image[${idx}]" is not a valid URL: "${img}"`);
      } else if (typeof img === 'object' && img !== null && img['@type'] !== 'ImageObject') {
        warnings.push(`"image[${idx}]" should have "@type": "ImageObject"`);
      }
    });
  }

  // Check for sameAs
  if (json.sameAs !== undefined) {
    if (!Array.isArray(json.sameAs)) {
      errors.push('"sameAs" must be an array');
    } else {
      json.sameAs.forEach((url: any, idx: number) => {
        if (!isValidUrl(url)) {
          errors.push(`"sameAs[${idx}]" is not a valid URL: "${url}"`);
        }
      });
    }
  }
}

// ========== Main Validation Function ==========

export function validateSchema(json: any): {
  errors: string[];
  warnings: string[];
  type: string;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let type = 'Unknown';

  if (!json || typeof json !== 'object') {
    return {
      errors: ['Invalid structure: Root must be an object'],
      warnings: [],
      type,
    };
  }

  // Basic checks
  if (!json['@context']) {
    errors.push('Missing property "@context" (must be "https://schema.org")');
  }
  if (!json['@type']) {
    errors.push('Missing property "@type"');
  } else {
    type = json['@type'];
  }

  // If there are basic errors, don't continue
  if (errors.length > 0) {
    return { errors, warnings, type };
  }

  // Select schema by type
  let schema: z.ZodTypeAny | null = null;

  switch (type) {
    case 'Product':
      schema = ProductSchema;
      break;
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      schema = ArticleSchema;
      break;
    case 'BreadcrumbList':
      schema = BreadcrumbListSchema;
      break;
    case 'Organization':
      schema = OrganizationSchema;
      break;
    case 'FAQPage':
      schema = FAQPageSchema;
      break;
    case 'LocalBusiness':
      schema = LocalBusinessSchema;
      break;
    case 'Event':
      schema = EventSchema;
      break;
    case 'HowTo':
      schema = HowToSchema;
      break;
    case 'Recipe':
      schema = RecipeSchema;
      break;
    case 'Review':
      schema = ReviewSchema;
      break;
    case 'VideoObject':
      schema = VideoObjectSchema;
      break;
    case 'Course':
      schema = CourseSchema;
      break;
    case 'WebSite':
      schema = WebSiteSchema;
      break;
    case 'SoftwareApplication':
      schema = SoftwareApplicationSchema;
      break;
    case 'Person':
      schema = PersonSchema;
      break;
    case 'TechArticle':
      schema = TechArticleSchema;
      break;
    case 'ContactPoint':
      schema = ContactPointSchema;
      break;
    case 'ImageObject':
      schema = ImageObjectSchemaFull;
      break;
    case 'Offer':
      schema = OfferSchemaFull;
      break;
    case 'AggregateRating':
      schema = AggregateRatingSchemaFull;
      break;
    case 'PostalAddress':
      schema = PostalAddressSchemaFull;
      break;
    case 'GeoCoordinates':
      schema = GeoCoordinatesSchemaFull;
      break;
    case 'Place':
      schema = PlaceSchema;
      break;
    case 'VirtualLocation':
      schema = VirtualLocationSchema;
      break;
    case 'Brand':
      schema = BrandSchema;
      break;
    case 'Rating':
      schema = RatingSchema;
      break;
    case 'ItemList':
      schema = ItemListSchema;
      break;
  }

  // Validation via Zod
  if (schema) {
    const result = schema.safeParse(json);
    if (!result.success) {
      result.error.issues.forEach((err: z.ZodIssue) => {
        const message = err.message || `${err.path.join('.')} is invalid`;
        // Check if this is a warning (fatal: false)
        if ((err as any).fatal === false) {
          warnings.push(message);
        } else {
          errors.push(message);
        }
      });
    }
  }

  // Common checks for all types
  validateCommonFields(json, errors, warnings);

  return { errors, warnings, type };
}
