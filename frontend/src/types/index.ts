export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DisposalInfo {
  recyclable: boolean;
  recyclability_type: string;
  recommended_bin: string;
  bin_color_hex: string;
  bin_badge: string;
  disposal_method: string;
  handling_instructions: string[];
  hazard_level: string;
  eco_tip?: string;
}

export interface DetectedObject {
  object_id: number;
  label: string;
  category: string;
  confidence: number;
  bounding_box: BoundingBox;
  disposal_info: DisposalInfo;
  explanation: string;
}

export interface PredictionResponse {
  record_id?: string;
  timestamp: string;
  total_objects: number;
  primary_category: string;
  average_confidence: number;
  inference_time_ms: number;
  model_mode: 'custom_fine_tuned' | 'pretrained_mapped' | 'fallback_heuristic';
  is_low_confidence: boolean;
  warning_message?: string;
  annotated_image_url?: string;
  original_image_url?: string;
  objects: DetectedObject[];
}

export interface HistoryItem {
  id: string;
  created_at: string;
  original_image_url?: string;
  annotated_image_url?: string;
  total_objects: number;
  primary_category: string;
  average_confidence: number;
  inference_time_ms: number;
  model_mode: string;
  source: string;
  objects: DetectedObject[];
}

export interface HistoryListResponse {
  total: number;
  page: number;
  limit: number;
  items: HistoryItem[];
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DailyTrendStat {
  date: string;
  scans: number;
  items_detected: number;
  recyclable: number;
  non_recyclable: number;
}

export interface ConfidenceBucket {
  range: string;
  count: number;
}

export interface StatisticsResponse {
  total_scans: number;
  total_items_detected: number;
  recyclable_count: number;
  non_recyclable_count: number;
  recyclable_percentage: number;
  most_common_category: string;
  average_overall_confidence: number;
  category_distribution: CategoryStat[];
  daily_trends: DailyTrendStat[];
  confidence_histogram: ConfidenceBucket[];
}

export interface CategoryMetadata {
  category: string;
  recyclable: boolean;
  recyclability_type: string;
  recommended_bin: string;
  bin_color_hex: string;
  bin_badge: string;
  default_disposal_method: string;
  instructions: string[];
  hazard_level: string;
  eco_tip?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  service: string;
  version: string;
  uptime_seconds: number;
  database: {
    status: string;
    dialect: string;
  };
  model: {
    mode: string;
    name: string;
    confidence_threshold: number;
    custom_weights_present: boolean;
  };
  storage: {
    upload_dir: string;
    writable: boolean;
  };
}
