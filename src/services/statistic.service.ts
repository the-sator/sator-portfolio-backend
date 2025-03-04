import { BlogMetricRepository } from "@/repositories/blog-metric.repository";
import { PortfolioMetricRepository } from "@/repositories/portfolio-metric.repository";
import { SiteMetricRepository } from "@/repositories/site-metric-repository";
import type { DailyMetric } from "@/types/statistic.type";

export class StatisticService {
  private portfolioMetricRepository: PortfolioMetricRepository;
  private siteMetricRepository: SiteMetricRepository;
  private blogMetricRepository: BlogMetricRepository;
  constructor() {
    this.portfolioMetricRepository = new PortfolioMetricRepository();
    this.siteMetricRepository = new SiteMetricRepository();
    this.blogMetricRepository = new BlogMetricRepository();
  }
  public async getSiteUserTotalMetric(site_user_id: string) {
    const portfolioAsync =
      await this.portfolioMetricRepository.getTotalBySiteUser(site_user_id);
    const siteAsync = await this.siteMetricRepository.getTotalBySiteUser(
      site_user_id
    );
    const blogAsync = await this.blogMetricRepository.getTotalBySiteUser(
      site_user_id
    );
    const [portfolio, site, blog] = await Promise.all([
      portfolioAsync,
      siteAsync,
      blogAsync,
    ]);
    return {
      ...portfolio,
      ...site,
      ...blog,
    };
  }
  public async getSiteUserDailyMetric(site_user_id: string) {
    const portfolioAsync =
      await this.portfolioMetricRepository.getDailyBySiteUser(site_user_id);
    const siteAsync = await this.siteMetricRepository.getDailyBySiteUser(
      site_user_id
    );
    const blogAsync = await this.blogMetricRepository.getDailyBySiteUser(
      site_user_id
    );

    const [portfolio, site, blog] = await Promise.all([
      portfolioAsync,
      siteAsync,
      blogAsync,
    ]);
    // Create a map of dates to merged metrics
    const metricsMap = new Map<string, DailyMetric>();

    // Process portfolio metrics
    portfolio.forEach((p) => {
      const date = p.created_at.toISOString().split("T")[0];
      metricsMap.set(date, {
        created_at: p.created_at,
        portfolio_views: p.portfolio_views,
        site_views: 0, // Default value
        blog_views: 0,
      });
    });

    // Process portfolio metrics
    blog.forEach((b) => {
      const date = b.created_at.toISOString().split("T")[0];
      if (metricsMap.has(date)) {
        // Update existing entry
        const metric = metricsMap.get(date);
        if (metric) {
          metric.blog_views = b.blog_views;
        }
      } else {
        // Create new entry
        metricsMap.set(date, {
          created_at: b.created_at,
          blog_views: b.blog_views,
          portfolio_views: 0,
          site_views: 0,
        });
      }
    });

    // Process and merge site metrics
    site.forEach((s) => {
      const date = s.created_at.toISOString().split("T")[0];
      if (metricsMap.has(date)) {
        // Update existing entry
        const metric = metricsMap.get(date);
        if (metric) {
          metric.site_views = s.site_views;
        }
      } else {
        // Create new entry
        metricsMap.set(date, {
          created_at: s.created_at,
          site_views: s.site_views,
          portfolio_views: 0,
          blog_views: 0,
        });
      }
    });

    // Convert map back to array
    const mergedMetrics = Array.from(metricsMap.values());

    // Sort by date if needed
    mergedMetrics.sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime()
    );

    return mergedMetrics;
  }
}
