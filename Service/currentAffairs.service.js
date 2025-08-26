// Services/currentAffairs.service.js - Improved Version with Better Error Handling
import { CurrentAffairsRepository } from '../Repository/currentAffairs.repository.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

export class CurrentAffairsService {
  constructor() {
    this.repository = new CurrentAffairsRepository();
    
    // Validate API keys on initialization
    this.validateAPIKeys();
    
    // Initialize AI only if API key is valid
    if (this.isGeminiAPIValid) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Try different model names in order of preference
        this.initializeGeminiModel();
      } catch (error) {
        console.error('Error initializing Gemini AI:', error);
        this.isGeminiAPIValid = false;
      }
    }
    
    // Government exam categories for current affairs
    this.examCategories = {
      upsc: ['politics', 'economics', 'international relations', 'science', 'environment', 'geography', 'history', 'culture'],
      pcs: ['state politics', 'local governance', 'state economy', 'regional issues', 'national politics'],
      ssc: ['general awareness', 'current events', 'sports', 'awards', 'books', 'important dates'],
      banking: ['financial sector', 'rbi policies', 'banking regulations', 'monetary policy', 'financial markets'],
      railway: ['transportation', 'infrastructure', 'technology', 'safety', 'government schemes']
    };

    // Prioritized search queries (start with most important)
    this.searchQueries = {
      politics: 'India politics government policy recent news',
      economics: 'India economy GDP inflation budget economic policy',
      science: 'science technology innovation research India ISRO',
      environment: 'climate change environment pollution sustainable development India',
      'government schemes': 'government schemes policies welfare programs India'
    };

    // Initialize axios instance with better defaults
    this.axiosInstance = axios.create({
      timeout: 15000, // 15 second timeout
      retry: 2, // Custom retry logic
      retryDelay: 1000 // 1 second between retries
    });

    // Setup axios interceptors for retry logic
    this.setupAxiosRetry();
  }

  /**
   * Setup axios retry interceptor
   */
  setupAxiosRetry() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // Don't retry if we've already retried or if it's not a timeout/network error
        if (!config || config.__retryCount >= 2) {
          return Promise.reject(error);
        }
        
        // Check if it's a retryable error
        const isRetryable = 
          error.code === 'ECONNABORTED' || // Timeout
          error.code === 'ENOTFOUND' ||   // DNS error
          error.code === 'ECONNRESET' ||  // Connection reset
          (error.response && error.response.status >= 500); // Server errors

        if (!isRetryable) {
          return Promise.reject(error);
        }

        config.__retryCount = (config.__retryCount || 0) + 1;
        
        console.log(`🔄 Retrying request (attempt ${config.__retryCount}/2): ${config.url}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.__retryCount * 1000));
        
        return this.axiosInstance(config);
      }
    );
  }

  /**
   * Initialize Gemini model with fallback to different model names
   */
  async initializeGeminiModel() {
    const modelNames = [
      "gemini-1.5-flash",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`🧠 Trying Gemini model: ${modelName}`);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        
        // Test the model with a simple prompt (with timeout)
        const testPromise = this.model.generateContent("Test");
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Model test timeout')), 10000)
        );
        
        const testResult = await Promise.race([testPromise, timeoutPromise]);
        await testResult.response;
        
        console.log(`✅ Successfully initialized Gemini model: ${modelName}`);
        this.currentModel = modelName;
        this.isGeminiAPIValid = true;
        return;
      } catch (error) {
        console.warn(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All Gemini models failed. Using fallback processing only.');
    this.isGeminiAPIValid = false;
    this.model = null;
  }

  /**
   * Validate API keys on startup
   */
  validateAPIKeys() {
    console.log('🔍 Validating API Keys...');
    
    // Check Google API Key
    this.isGeminiAPIValid = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '');
    if (!this.isGeminiAPIValid) {
      console.warn('❌ GOOGLE_API_KEY is missing or invalid');
      console.warn('   AI analysis features will be disabled');
    } else {
      console.log('✅ Google Gemini API Key found');
    }
    
    // Check Google Search API Key
    this.isSearchAPIValid = !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
    if (!this.isSearchAPIValid) {
      console.warn('❌ Google Search API keys are missing');
      console.warn('   Real-time news fetching will be disabled');
    } else {
      console.log('✅ Google Search API Keys found');
    }
    
    // Show overall status
    if (!this.isGeminiAPIValid && !this.isSearchAPIValid) {
      console.warn('⚠️  All external APIs are disabled. System will work with sample data only.');
    } else if (!this.isGeminiAPIValid) {
      console.warn('⚠️  AI analysis disabled. News fetching will work without AI processing.');
    } else if (!this.isSearchAPIValid) {
      console.warn('⚠️  News fetching disabled. AI analysis will work with existing data.');
    } else {
      console.log('🚀 All APIs are configured correctly!');
    }
  }

  /**
   * Get daily current affairs with fallback handling
   */
  async getDailyCurrentAffairs(date = null, language = 'en') {
    try {
      const targetDate = date ? new Date(date) : new Date();
      const dateString = targetDate.toISOString().split('T')[0];
      
      // Check if we have cached data for today
      let cachedData = await this.repository.getCurrentAffairsByDate(dateString);
      
      if (!cachedData || cachedData.length === 0) {
        // Try to fetch fresh data if APIs are available
        if (this.isSearchAPIValid) {
          console.log('📰 No cached data found. Fetching fresh current affairs...');
          try {
            cachedData = await this.fetchAndProcessCurrentAffairs(dateString);
          } catch (fetchError) {
            console.warn('⚠️  Failed to fetch fresh data, using sample data:', fetchError.message);
            cachedData = await this.getSampleCurrentAffairs(dateString);
          }
        } else {
          // Return sample data if no APIs are configured
          console.log('📋 Returning sample data (APIs not configured)');
          cachedData = await this.getSampleCurrentAffairs(dateString);
        }
      } else {
        console.log(`📚 Found ${cachedData.length} cached current affairs for ${dateString}`);
      }
      
      return {
        date: dateString,
        totalItems: cachedData.length,
        currentAffairs: cachedData,
        categories: this.getCategoriesFromData(cachedData),
        examRelevance: await this.analyzeExamRelevance(cachedData),
        apiStatus: {
          geminiAI: this.isGeminiAPIValid,
          geminiModel: this.currentModel || 'Not Available',
          searchAPI: this.isSearchAPIValid
        }
      };
    } catch (error) {
      console.error('Error in getDailyCurrentAffairs:', error);
      
      // As a last resort, always return sample data
      console.log('🆘 Returning sample data due to error');
      const dateString = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const sampleData = await this.getSampleCurrentAffairs(dateString);
      
      return {
        date: dateString,
        totalItems: sampleData.length,
        currentAffairs: sampleData,
        categories: this.getCategoriesFromData(sampleData),
        examRelevance: await this.analyzeExamRelevance(sampleData),
        apiStatus: {
          geminiAI: this.isGeminiAPIValid,
          geminiModel: this.currentModel || 'Not Available',
          searchAPI: this.isSearchAPIValid
        },
        note: 'Sample data returned due to API issues'
      };
    }
  }
  // Services/currentAffairs.service.js - Add this method to the class

/**
 * Get all current affairs with pagination
 */
async getAllCurrentAffairs(page = 1, limit = 50, category = null, sortBy = 'date', sortOrder = 'DESC') {
  try {
    return await this.repository.getAllCurrentAffairs(
      parseInt(page),
      parseInt(limit),
      category,
      sortBy,
      sortOrder
    );
  } catch (error) {
    console.error('Error in getAllCurrentAffairs:', error);
    throw error;
  }
}

  /**
   * Fetch and process current affairs with improved error handling and timeout
   */
  async fetchAndProcessCurrentAffairs(date) {
    try {
      if (!this.isSearchAPIValid) {
        throw new Error('Google Search API not configured');
      }

      const allNews = [];
      const categories = Object.keys(this.searchQueries);
      
      console.log(`🔍 Fetching news for ${categories.length} categories...`);
      
      // Process categories with timeout and limits
      const maxCategoriesAtOnce = 3; // Process 3 categories at a time
      const categoriesProcessed = [];
      
      for (let i = 0; i < categories.length; i += maxCategoriesAtOnce) {
        const categoryBatch = categories.slice(i, i + maxCategoriesAtOnce);
        
        const batchPromises = categoryBatch.map(async (category) => {
          try {
            console.log(`📡 Fetching ${category} news...`);
            const query = this.searchQueries[category];
            const newsItems = await this.searchGoogleNewsWithTimeout(query, 3); // Reduced to 3 items
            
            const processedItems = [];
            for (const item of newsItems) {
              const processedItem = await this.processNewsItemWithFallback(item, category, date);
              if (processedItem) {
                processedItems.push(processedItem);
              }
            }
            
            categoriesProcessed.push(category);
            return processedItems;
          } catch (error) {
            console.error(`❌ Error fetching news for category ${category}:`, error.message);
            return []; // Return empty array instead of failing
          }
        });
        
        // Wait for batch to complete with timeout
        try {
          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              allNews.push(...result.value);
            } else {
              console.warn(`⚠️  Category ${categoryBatch[index]} failed:`, result.reason?.message);
            }
          });
        } catch (batchError) {
          console.error('❌ Batch processing error:', batchError.message);
        }
        
        // Add delay between batches
        if (i + maxCategoriesAtOnce < categories.length) {
          console.log('⏳ Waiting between batches...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`✅ Fetched ${allNews.length} total news items from ${categoriesProcessed.length} categories`);
      
      // If we got very few items, add sample data
      if (allNews.length < 5) {
        console.log('📝 Adding sample data to supplement limited results');
        const sampleData = await this.getSampleCurrentAffairs(date);
        allNews.push(...sampleData);
      }
      
      // Remove duplicates and sort by relevance
      const uniqueNews = this.removeDuplicates(allNews);
      const sortedNews = this.sortByRelevance(uniqueNews);
      
      // Save to database
      if (sortedNews.length > 0) {
        await this.repository.saveCurrentAffairs(sortedNews, date);
        console.log(`💾 Saved ${sortedNews.length} news items to database`);
      }
      
      return sortedNews;
    } catch (error) {
      console.error('Error in fetchAndProcessCurrentAffairs:', error);
      throw error; // Re-throw so caller can handle
    }
  }

  /**
   * Search Google for news articles with improved timeout handling
   */
  async searchGoogleNewsWithTimeout(query, numResults = 3) {
    try {
      if (!this.isSearchAPIValid) {
        return [];
      }

      const searchUrl = 'https://www.googleapis.com/customsearch/v1';
      const params = {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: numResults,
        sort: 'date',
        dateRestrict: 'd7' // Last 7 days
      };
      
      // Use the custom axios instance with retry logic
      const response = await this.axiosInstance.get(searchUrl, { params });
      
      if (response.data && response.data.items) {
        return response.data.items.map(item => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl,
          publishDate: this.extractPublishDate(item)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error in searchGoogleNewsWithTimeout:', error.message);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Process individual news item with fallback (no AI if API key invalid)
   */
  async processNewsItemWithFallback(newsItem, category, date) {
    try {
      let aiAnalysis = {};
      
      // Try to use AI analysis if available (with timeout)
      if (this.isGeminiAPIValid && this.model) {
        try {
          const aiPromise = this.processNewsItemWithAI(newsItem, category);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI processing timeout')), 15000)
          );
          
          aiAnalysis = await Promise.race([aiPromise, timeoutPromise]);
          console.log(`🧠 AI processed: ${newsItem.title.substring(0, 50)}...`);
        } catch (error) {
          console.warn('⚠️  AI processing failed, using fallback processing:', error.message);
          aiAnalysis = this.processNewsItemFallback(newsItem, category);
        }
      } else {
        // Use fallback processing without AI
        aiAnalysis = this.processNewsItemFallback(newsItem, category);
      }
      
      return {
        id: this.generateUniqueId(),
        title: newsItem.title,
        summary: aiAnalysis.summary || newsItem.snippet,
        content: newsItem.snippet,
        source: newsItem.displayLink,
        url: newsItem.link,
        category: category,
        date: date,
        keyFacts: aiAnalysis.keyFacts || [],
        examRelevance: aiAnalysis.examRelevance || this.getDefaultExamRelevance(category),
        relatedTopics: aiAnalysis.relatedTopics || [],
        mcqQuestion: aiAnalysis.mcqQuestion || null,
        tags: aiAnalysis.tags || [category],
        difficulty: aiAnalysis.difficulty || 'Medium',
        importance: aiAnalysis.importance || 5,
        publishDate: newsItem.publishDate,
        createdAt: new Date().toISOString(),
        processedWith: this.isGeminiAPIValid ? 'AI' : 'Fallback'
      };
    } catch (error) {
      console.error('Error processing news item:', error);
      return null;
    }
  }

  /**
   * Process news item with AI (updated with better error handling)
   */
  async processNewsItemWithAI(newsItem, category) {
    if (!this.model) {
      throw new Error('Gemini model not available');
    }

    const prompt = `
      Analyze this news for Indian government job exams (UPSC, PCS, SSC, Banking, Railway):

      Title: ${newsItem.title}
      Content: ${newsItem.snippet}
      Category: ${category}

      Provide ONLY a JSON response:
      {
        "summary": "Brief 2-3 line summary",
        "keyFacts": ["fact1", "fact2", "fact3"],
        "examRelevance": {
          "upsc": 5,
          "pcs": 5,
          "ssc": 5,
          "banking": 5,
          "railway": 5
        },
        "relatedTopics": ["topic1", "topic2"],
        "mcqQuestion": {
          "question": "Question?",
          "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
          "correctAnswer": "A",
          "explanation": "Brief explanation"
        },
        "tags": ["tag1", "tag2"],
        "difficulty": "Medium",
        "importance": 7
      }
    `;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('AI processing error:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced fallback processing without AI
   */
  processNewsItemFallback(newsItem, category) {
    const title = newsItem.title.toLowerCase();
    const content = newsItem.snippet.toLowerCase();
    
    // Extract key facts from title and content
    const keyFacts = this.extractKeyFactsFallback(newsItem.title, newsItem.snippet);
    
    // Generate exam relevance based on category
    const examRelevance = this.getDefaultExamRelevance(category);
    
    // Calculate importance based on keywords
    const importance = this.calculateImportanceFallback(title, content, category);
    
    // Generate related topics
    const relatedTopics = this.generateRelatedTopicsFallback(category, title);
    
    // Generate basic tags
    const tags = this.generateTagsFallback(category, title, content);
    
    return {
      summary: this.generateSummaryFallback(newsItem.snippet),
      keyFacts,
      examRelevance,
      relatedTopics,
      mcqQuestion: this.generateBasicMCQ(newsItem.title, category),
      tags,
      difficulty: 'Medium',
      importance
    };
  }

  /**
   * Generate comprehensive sample current affairs data
   */
  async getSampleCurrentAffairs(date) {
    const sampleData = [
      {
        id: `CA-SAMPLE-${Date.now()}-1`,
        title: "India's Digital Infrastructure Development Accelerates",
        summary: "Government announces new digital infrastructure initiatives to boost connectivity and digital governance across rural and urban areas.",
        content: "The Government of India has unveiled comprehensive digital infrastructure development plans focusing on enhancing connectivity in rural areas and strengthening digital governance mechanisms.",
        source: "Government Portal",
        url: "#sample-1",
        category: "politics",
        date: date,
        keyFacts: [
          "Digital infrastructure expansion announced",
          "Rural connectivity focus",
          "Government digital governance initiative",
          "Investment of ₹1 lakh crore planned"
        ],
        examRelevance: {
          upsc: 9,
          pcs: 8,
          ssc: 6,
          banking: 5,
          railway: 5
        },
        relatedTopics: ["Digital India", "Infrastructure", "Governance", "Rural Development"],
        mcqQuestion: {
          question: "Which initiative focuses on digital infrastructure development in India?",
          options: {
            A: "Digital India Mission",
            B: "Smart Cities Mission", 
            C: "Skill India Program",
            D: "Make in India"
          },
          correctAnswer: "A",
          explanation: "Digital India Mission is the primary government initiative for digital infrastructure development."
        },
        tags: ["politics", "digital", "infrastructure", "governance"],
        difficulty: "Medium",
        importance: 8,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processedWith: "Sample"
      },
      {
        id: `CA-SAMPLE-${Date.now()}-2`,
        title: "RBI Monetary Policy Review: Repo Rate Maintained at 6.5%",
        summary: "Reserve Bank of India maintains repo rate at 6.5% in latest monetary policy review, citing economic stability and inflation control measures.",
        content: "The Reserve Bank of India's Monetary Policy Committee has decided to maintain the repo rate at 6.5% considering current economic indicators and inflation trends.",
        source: "Economic Times",
        url: "#sample-2",
        category: "economics",
        date: date,
        keyFacts: [
          "Repo rate maintained at 6.5%",
          "MPC decision unanimous",
          "Inflation within target range",
          "GDP growth projection revised"
        ],
        examRelevance: {
          upsc: 8,
          pcs: 6,
          ssc: 5,
          banking: 10,
          railway: 4
        },
        relatedTopics: ["Monetary Policy", "RBI", "Inflation", "Economic Growth"],
        mcqQuestion: {
          question: "What is the current repo rate maintained by RBI?",
          options: {
            A: "6.0%",
            B: "6.5%",
            C: "7.0%",
            D: "7.5%"
          },
          correctAnswer: "B",
          explanation: "The Reserve Bank of India has maintained the repo rate at 6.5% in its latest monetary policy review."
        },
        tags: ["economics", "RBI", "monetary", "policy"],
        difficulty: "Medium",
        importance: 9,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processedWith: "Sample"
      },
      {
        id: `CA-SAMPLE-${Date.now()}-3`,
        title: "ISRO Successfully Launches Chandrayaan-4 Mission",
        summary: "Indian Space Research Organisation achieves another milestone with successful launch of Chandrayaan-4 lunar exploration mission.",
        content: "ISRO has successfully launched Chandrayaan-4, India's fourth lunar mission, aimed at advanced lunar exploration and sample collection.",
        source: "Science Today",
        url: "#sample-3",
        category: "science",
        date: date,
        keyFacts: [
          "Chandrayaan-4 mission launched successfully",
          "Lunar sample collection planned",
          "Advanced exploration technology",
          "International collaboration involved"
        ],
        examRelevance: {
          upsc: 8,
          pcs: 5,
          ssc: 7,
          banking: 3,
          railway: 6
        },
        relatedTopics: ["ISRO", "Space Technology", "Lunar Exploration", "Scientific Research"],
        mcqQuestion: {
          question: "Which is the latest lunar mission launched by ISRO?",
          options: {
            A: "Chandrayaan-2",
            B: "Chandrayaan-3", 
            C: "Chandrayaan-4",
            D: "Mangalyaan-2"
          },
          correctAnswer: "C",
          explanation: "Chandrayaan-4 is the latest lunar exploration mission launched by ISRO for advanced lunar studies."
        },
        tags: ["science", "ISRO", "space", "technology"],
        difficulty: "Easy",
        importance: 7,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processedWith: "Sample"
      },
      {
        id: `CA-SAMPLE-${Date.now()}-4`,
        title: "Supreme Court Verdict on Environmental Protection Act",
        summary: "Supreme Court delivers landmark judgment on environmental protection, setting new guidelines for industrial compliance and pollution control.",
        content: "The Supreme Court has issued comprehensive guidelines for environmental protection, mandating stricter compliance measures for industries.",
        source: "Legal News",
        url: "#sample-4",
        category: "environment",
        date: date,
        keyFacts: [
          "Supreme Court environmental verdict",
          "New industrial compliance guidelines",
          "Pollution control measures strengthened",
          "Timeline for implementation set"
        ],
        examRelevance: {
          upsc: 9,
          pcs: 7,
          ssc: 6,
          banking: 4,
          railway: 5
        },
        relatedTopics: ["Environmental Law", "Supreme Court", "Pollution Control", "Industrial Policy"],
        mcqQuestion: {
          question: "Which court delivered the recent landmark judgment on environmental protection?",
          options: {
            A: "High Court",
            B: "District Court",
            C: "Supreme Court",
            D: "Green Tribunal"
          },
          correctAnswer: "C",
          explanation: "The Supreme Court of India delivered the landmark judgment on environmental protection and industrial compliance."
        },
        tags: ["environment", "supreme court", "pollution", "law"],
        difficulty: "Medium",
        importance: 8,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processedWith: "Sample"
      },
      {
        id: `CA-SAMPLE-${Date.now()}-5`,
        title: "India Achieves Renewable Energy Milestone: 50% Target Reached",
        summary: "India reaches significant renewable energy milestone by achieving 50% of electricity generation from renewable sources ahead of schedule.",
        content: "India has successfully achieved 50% of its electricity generation from renewable energy sources, surpassing expectations and timeline.",
        source: "Energy Today",
        url: "#sample-5",
        category: "environment",
        date: date,
        keyFacts: [
          "50% renewable energy target achieved",
          "Ahead of scheduled timeline",
          "Solar and wind energy major contributors",
          "International recognition received"
        ],
        examRelevance: {
          upsc: 8,
          pcs: 6,
          ssc: 7,
          banking: 5,
          railway: 6
        },
        relatedTopics: ["Renewable Energy", "Climate Change", "Energy Policy", "Sustainable Development"],
        mcqQuestion: {
          question: "What percentage of renewable energy target has India recently achieved?",
          options: {
            A: "30%",
            B: "40%",
            C: "50%",
            D: "60%"
          },
          correctAnswer: "C",
          explanation: "India has achieved 50% of its electricity generation from renewable energy sources, marking a significant milestone."
        },
        tags: ["environment", "renewable", "energy", "achievement"],
        difficulty: "Easy",
        importance: 8,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        processedWith: "Sample"
      }
    ];

    // Save sample data to database
    try {
      await this.repository.saveCurrentAffairs(sampleData, date);
      console.log(`💾 Saved ${sampleData.length} sample items to database`);
    } catch (error) {
      console.error('Error saving sample data:', error);
    }

    return sampleData;
  }

  // ... (include all the helper methods from the previous version)

  /**
   * Helper methods for fallback processing
   */
  
  extractKeyFactsFallback(title, content) {
    const facts = [];
    
    // Extract from title
    if (title.includes('%')) {
      const percentMatch = title.match(/(\d+\.?\d*%)/g);
      if (percentMatch) {
        facts.push(`Percentage mentioned: ${percentMatch[0]}`);
      }
    }
    
    // Extract numbers/years
    const numberMatch = title.match(/(\d{4}|\d+%|\d+\.?\d*)/g);
    if (numberMatch) {
      facts.push(`Key figure: ${numberMatch[0]}`);
    }
    
    // Extract organization names
    const orgMatch = title.match(/(RBI|ISRO|Parliament|Supreme Court|Government|Ministry)/gi);
    if (orgMatch) {
      facts.push(`Organization involved: ${orgMatch[0]}`);
    }
    
    // Extract from content (first meaningful sentence)
    const sentences = content.split('.');
    if (sentences.length > 0 && sentences[0].length > 20) {
      facts.push(sentences[0].trim());
    }
    
    return facts.slice(0, 3); // Limit to 3 facts
  }

  getDefaultExamRelevance(category) {
    const relevanceMap = {
      politics: { upsc: 9, pcs: 8, ssc: 6, banking: 4, railway: 5 },
      economics: { upsc: 8, pcs: 6, ssc: 5, banking: 9, railway: 4 },
      science: { upsc: 7, pcs: 5, ssc: 8, banking: 3, railway: 6 },
      environment: { upsc: 8, pcs: 6, ssc: 6, banking: 3, railway: 5 },
      sports: { upsc: 5, pcs: 4, ssc: 7, banking: 2, railway: 3 },
      'international relations': { upsc: 9, pcs: 5, ssc: 4, banking: 3, railway: 3 },
      infrastructure: { upsc: 6, pcs: 7, ssc: 5, banking: 4, railway: 8 },
      'government schemes': { upsc: 8, pcs: 9, ssc: 7, banking: 5, railway: 6 }
    };
    
    return relevanceMap[category] || { upsc: 5, pcs: 5, ssc: 5, banking: 5, railway: 5 };
  }

  calculateImportanceFallback(title, content, category) {
    let importance = 5; // Default
    
    // High importance keywords
    const highImportanceKeywords = ['parliament', 'supreme court', 'rbi', 'budget', 'policy', 'act', 'bill', 'launch', 'announcement'];
    const mediumImportanceKeywords = ['government', 'minister', 'official', 'report', 'study'];
    
    const text = (title + ' ' + content).toLowerCase();
    
    for (const keyword of highImportanceKeywords) {
      if (text.includes(keyword)) {
        importance += 2;
        break;
      }
    }
    
    for (const keyword of mediumImportanceKeywords) {
      if (text.includes(keyword)) {
        importance += 1;
        break;
      }
    }
    
    // Category-based importance
    if (['politics', 'economics'].includes(category)) {
      importance += 1;
    }
    
    return Math.min(importance, 10); // Cap at 10
  }

  generateRelatedTopicsFallback(category, title) {
    const topicMap = {
      politics: ['Governance', 'Public Policy', 'Constitution', 'Parliament', 'Administration'],
      economics: ['Economic Survey', 'Budget', 'Monetary Policy', 'Inflation', 'GDP'],
      science: ['Innovation', 'Research', 'Technology', 'ISRO', 'Scientific Development'],
      environment: ['Climate Change', 'Sustainability', 'Pollution Control', 'Conservation', 'Green Energy'],
      infrastructure: ['Development Projects', 'Transportation', 'Connectivity', 'Smart Cities'],
      'government schemes': ['Welfare Programs', 'Social Security', 'Rural Development', 'Employment']
    };
    
    let topics = topicMap[category] || ['Current Affairs', 'General Knowledge'];
    
    // Add specific topics based on title keywords
    if (title.toLowerCase().includes('digital')) {
      topics.push('Digital India');
    }
    if (title.toLowerCase().includes('space')) {
      topics.push('Space Technology');
    }
    
    return topics.slice(0, 4); // Limit to 4 topics
  }

  generateTagsFallback(category, title, content) {
    const tags = [category];
    
    // Extract keywords from title
    const titleWords = title.toLowerCase().split(' ');
    const importantWords = titleWords.filter(word => 
      word.length > 4 && 
      !['india', 'indian', 'government', 'announces', 'says', 'reports'].includes(word)
    );
    
    tags.push(...importantWords.slice(0, 2));
    
    // Add specific tags based on content
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('digital')) tags.push('digital');
    if (text.includes('economic')) tags.push('economy');
    if (text.includes('policy')) tags.push('policy');
    if (text.includes('space')) tags.push('space');
    
    return [...new Set(tags)].slice(0, 5); // Remove duplicates and limit
  }

  /**
   * Generate a basic MCQ in fallback mode
   */
  generateBasicMCQ(title, category) {
    const cleanTitle = title.replace(/[^\w\s]/gi, '');
    
    return {
      question: `Which of the following statements about "${cleanTitle}" is most accurate?`,
      options: {
        A: "It is primarily related to economic development",
        B: "It has significant policy implications", 
        C: "It affects multiple sectors",
        D: "All of the above statements are correct"
      },
      correctAnswer: "D",
      explanation: `This news relates to ${category} and likely has broader implications. For detailed analysis, AI processing is recommended.`
    };
  }

  /**
   * Generate better summary in fallback mode
   */
  generateSummaryFallback(snippet) {
    if (!snippet || snippet.length < 50) {
      return "Current affairs item requiring further analysis.";
    }
    
    // Take first two sentences or 150 characters, whichever is shorter
    const sentences = snippet.split('.');
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join('.') + '.';
    } else {
      return snippet.length > 150 ? snippet.substring(0, 150) + '...' : snippet;
    }
  }

  /**
   * Generate current affairs quiz with enhanced fallback
   */
  async generateCurrentAffairsQuiz(date, difficulty = 'medium', questionCount = 10, category = null) {
    try {
      const dateString = date || new Date().toISOString().split('T')[0];
      const currentAffairs = await this.repository.getCurrentAffairsByDate(dateString, category);
      
      if (!currentAffairs || currentAffairs.length === 0) {
        // Get sample data if no current affairs available
        console.log('📋 No current affairs found, generating sample quiz');
        const sampleData = await this.getSampleCurrentAffairs(dateString);
        return this.generateQuizFallback(sampleData, difficulty, questionCount);
      }
      
      // If AI is available, try to generate with AI
      if (this.isGeminiAPIValid && this.model) {
        try {
          return await this.generateQuizWithAI(currentAffairs, difficulty, questionCount);
        } catch (error) {
          console.warn('⚠️  AI quiz generation failed, using fallback:', error.message);
          return this.generateQuizFallback(currentAffairs, difficulty, questionCount);
        }
      } else {
        // Generate basic quiz without AI
        return this.generateQuizFallback(currentAffairs, difficulty, questionCount);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  /**
   * Generate quiz with AI
   */
  async generateQuizWithAI(currentAffairs, difficulty, questionCount) {
    const selectedItems = currentAffairs.slice(0, Math.min(questionCount, currentAffairs.length));
    
    const quizPrompt = `
    Create ${questionCount} multiple choice questions from these current affairs items:

    ${selectedItems.map((item, index) => `
    ${index + 1}. ${item.title}
    Summary: ${item.summary}
    Category: ${item.category}
    Key Facts: ${item.keyFacts ? item.keyFacts.join(', ') : 'N/A'}
    `).join('\n')}

    Requirements:
    - Difficulty: ${difficulty}
    - ${questionCount} questions total
    - Mix of factual and analytical questions
    - Suitable for government job exams

    Return ONLY a JSON object:
    {
      "quizTitle": "Current Affairs Quiz - ${difficulty}",
      "difficulty": "${difficulty}",
      "totalQuestions": ${questionCount},
      "questions": [
        {
          "id": 1,
          "question": "Question text?",
          "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
          "correctAnswer": "A",
          "explanation": "Brief explanation",
          "category": "category",
          "difficulty": "${difficulty}"
        }
      ]
    }
    `;

    const result = await this.model.generateContent(quizPrompt);
    const response = await result.response;
    const text = response.text();
    
    const quizData = this.parseAIResponse(text);
    quizData.generatedWith = `AI (${this.currentModel})`;
    
    return quizData;
  }

  /**
   * Generate quiz without AI (enhanced fallback)
   */
  generateQuizFallback(currentAffairs, difficulty, questionCount) {
    const questions = [];
    const availableItems = currentAffairs.slice(0, questionCount);
    
    availableItems.forEach((item, index) => {
      if (item.mcqQuestion) {
        questions.push({
          id: index + 1,
          ...item.mcqQuestion,
          category: item.category,
          difficulty: difficulty,
          examRelevance: Object.keys(item.examRelevance).filter(exam => item.examRelevance[exam] >= 6)
        });
      } else {
        // Generate basic question from title and facts
        const keyFact = item.keyFacts && item.keyFacts.length > 0 ? item.keyFacts[0] : 'Key information available';
        
        questions.push({
          id: index + 1,
          question: `What is the most significant aspect of "${item.title}"?`,
          options: {
            A: keyFact,
            B: `It relates to ${item.category} sector`,
            C: `It has implications for policy making`,
            D: "All of the above are correct"
          },
          correctAnswer: "D",
          explanation: `This current affairs item relates to ${item.category} and has multiple implications. Key fact: ${keyFact}`,
          category: item.category,
          difficulty: difficulty,
          examRelevance: Object.keys(item.examRelevance).filter(exam => item.examRelevance[exam] >= 6)
        });
      }
    });
    
    return {
      quizTitle: `Current Affairs Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      difficulty: difficulty,
      totalQuestions: questions.length,
      questions: questions,
      generatedWith: 'Fallback Mode (Configure Google API for enhanced features)',
      note: 'Quiz generated using available current affairs data'
    };
  }

  /**
   * Utility methods
   */
  
  async generateUniqueId() {
    const id = await this.repository.getNextSequentialId();
    return id;
  }
  
  
  extractPublishDate(item) {
    if (item.pagemap && item.pagemap.metatags) {
      const meta = item.pagemap.metatags[0];
      return meta['article:published_time'] || meta.pubdate || meta.date || new Date().toISOString();
    }
    return new Date().toISOString();
  }
  
  parseAIResponse(text) {
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {};
    }
  }
  
  removeDuplicates(newsArray) {
    const seen = new Set();
    return newsArray.filter(item => {
      const key = item.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  sortByRelevance(newsArray) {
    return newsArray.sort((a, b) => {
      const scoreA = (a.importance || 0) + Object.values(a.examRelevance || {}).reduce((sum, val) => sum + val, 0);
      const scoreB = (b.importance || 0) + Object.values(b.examRelevance || {}).reduce((sum, val) => sum + val, 0);
      return scoreB - scoreA;
    });
  }
  
  getCategoriesFromData(data) {
    const categories = {};
    data.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    return categories;
  }
  
  async analyzeExamRelevance(data) {
    const relevance = {
      upsc: 0,
      pcs: 0,
      ssc: 0,
      banking: 0,
      railway: 0
    };
    
    data.forEach(item => {
      if (item.examRelevance) {
        Object.keys(relevance).forEach(exam => {
          relevance[exam] += item.examRelevance[exam] || 0;
        });
      }
    });
    
    return relevance;
  }

  // Health status with API validation
  async getHealthStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayCount = await this.repository.getCountByDate(today);
      const totalCount = await this.repository.getTotalCount();
      
      return {
        status: 'healthy',
        todayCount,
        totalCount,
        lastUpdate: new Date().toISOString(),
        apiStatus: {
          googleSearch: this.isSearchAPIValid,
          geminiAI: this.isGeminiAPIValid,
          geminiModel: this.currentModel || 'Not Available'
        },
        features: {
          newsRetrieve: this.isSearchAPIValid ? 'Available' : 'Disabled (API not configured)',
          aiAnalysis: this.isGeminiAPIValid ? 'Available' : 'Disabled (API not configured)',
          basicFunctionality: 'Available',
          sampleData: 'Available'
        },
        recommendations: this.getSetupRecommendations(),
        networkStatus: {
          timeout: '15 seconds',
          retryLogic: 'Enabled (2 retries)',
          batchProcessing: 'Enabled (3 categories at once)'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        apiStatus: {
          googleSearch: this.isSearchAPIValid,
          geminiAI: this.isGeminiAPIValid
        }
      };
    }
  }

  getSetupRecommendations() {
    const recommendations = [];
    
    if (!this.isGeminiAPIValid) {
      recommendations.push('Configure GOOGLE_API_KEY for AI analysis features');
    }
    
    if (!this.isSearchAPIValid) {
      recommendations.push('Configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID for real-time news');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All APIs configured correctly!');
    } else {
      recommendations.push('System works with sample data even without API configuration');
    }
    
    return recommendations;
  }

  // Enhanced methods for other endpoints
  async refreshCurrentAffairsData(forceUpdate = false) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!forceUpdate) {
        const existingData = await this.repository.getCurrentAffairsByDate(today);
        if (existingData && existingData.length > 0) {
          return { 
            message: 'Data is already up to date', 
            count: existingData.length,
            apiStatus: {
              googleSearch: this.isSearchAPIValid,
              geminiAI: this.isGeminiAPIValid
            }
          };
        }
      }
      
      let freshData;
      try {
        freshData = await this.fetchAndProcessCurrentAffairs(today);
      } catch (error) {
        console.warn('⚠️  Fresh data fetch failed, providing sample data:', error.message);
        freshData = await this.getSampleCurrentAffairs(today);
      }
      
      return {
        message: 'Current affairs data refreshed successfully',
        date: today,
        count: freshData.length,
        categories: this.getCategoriesFromData(freshData),
        apiStatus: {
          googleSearch: this.isSearchAPIValid,
          geminiAI: this.isGeminiAPIValid
        }
      };
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  }

  async getCurrentAffairsByRange(startDate, endDate, category = null, limit = 50) {
    return await this.repository.getCurrentAffairsByDateRange(startDate, endDate, category, limit);
  }

  async getCurrentAffairsByCategory(category, limit = 20, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return await this.repository.getCurrentAffairsByCategory(category, targetDate, limit);
  }

  async getTrendingTopics(examType = 'upsc', limit = 15) {
    try {
      const relevantCategories = this.examCategories[examType.toLowerCase()] || this.examCategories.upsc;
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7); // Last 7 days
      
      const trendingData = await this.repository.getTrendingTopics(
        recentDate.toISOString().split('T')[0],
        relevantCategories,
        limit
      );
      
      return {
        examType: examType.toUpperCase(),
        period: 'Last 7 days',
        totalTopics: trendingData.length,
        trendingTopics: trendingData,
        lastUpdated: new Date().toISOString(),
        note: trendingData.length === 0 ? 'No trending data available yet. Try refreshing current affairs first.' : undefined
      };
    } catch (error) {
      console.error('Error getting trending topics:', error);
      throw error;
    }
  }

  async getExamSpecificCurrentAffairs(examType, date = null, limit = 25) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const relevantCategories = this.examCategories[examType.toLowerCase()];
      
      if (!relevantCategories) {
        throw new Error(`Unsupported exam type: ${examType}`);
      }
      
      const examSpecificData = await this.repository.getExamSpecificCurrentAffairs(
        targetDate,
        examType.toLowerCase(),
        relevantCategories,
        limit
      );
      
      return {
        examType: examType.toUpperCase(),
        date: targetDate,
        totalItems: examSpecificData.length,
        currentAffairs: examSpecificData,
        studyRecommendations: {
          priorityTopics: relevantCategories.slice(0, 3),
          timeAllocation: 'Focus on high-relevance items (score >= 7)',
          revisionFrequency: 'Daily review recommended for government exams'
        }
      };
    } catch (error) {
      console.error('Error getting exam-specific current affairs:', error);
      throw error;
    }
  }
}