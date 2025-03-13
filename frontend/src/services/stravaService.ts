import { get, post } from "../api/request";

export interface StravaActivity {
  id: number;
  name: string;
  type?: string;
  sport_type?: string;
  start_date: string;
  start_date_local?: string;
  resource_state?: number;
  athlete?: {
    id: number;
    resource_state: number;
  };
  distance: number;
  moving_time: number;
  elapsed_time?: number;
  total_elevation_gain: number;
  timezone?: string;
  utc_offset?: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  achievement_count?: number;
  kudos_count?: number;
  comment_count?: number;
  athlete_count?: number;
  photo_count?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  visibility?: string;
  flagged?: boolean;
  gear_id?: string | null;
  start_latlng?: number[];
  end_latlng?: number[];
  average_speed: number;
  max_speed?: number;
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  device_watts?: boolean;
  kilojoules?: number;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id?: number;
  upload_id_str?: string;
  external_id?: string;
  from_accepted_tag?: boolean;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;

  stravaDataId?: number;
  activityId?: number;
  calories?: string;
  elevation?: string;
  movingTime?: string;
}

export interface StravaActivityPagedResponse {
  content: StravaActivity[];
  hasMore: boolean;
  page: number;
  size: number;
}

// Strava auth link
const getStravaLink = async (): Promise<string> => {
  return await get(`/strava/link`);
};

// Get user's Strava activities with pagination
const getStravaActivities = async (
  page: number = 1,
  perPage: number = 30
): Promise<StravaActivityPagedResponse> => {
  return await get(`/strava/activities?page=${page}&per_page=${perPage}`);
};

// Link a Strava activity to a lightning event
const linkActivityToLightning = async (
  activityId: number,
  lightningId: number
) => {
  return await post(
    `/strava/activities/${activityId}/lightning/${lightningId}`,
    {}
  );
};

// Get all Strava activities for a lightning event
const getLightningActivities = async (
  lightningId: number,
  page: number = 0,
  size: number = 10,
  sort: string = "stravaDataId",
  direction: string = "DESC"
) => {
  return await get(
    `/strava/lightning/${lightningId}/activities?page=${page}&size=${size}&sort=${sort}&direction=${direction}`
  );
};

// Get user's own Strava activity for a lightning event
const getUserLightningActivity = async (
  lightningId: number
): Promise<StravaActivity> => {
  try {
    return await get(`/strava/lightning/${lightningId}/my-activity`);
  } catch (error) {
    console.error("Error fetching user lightning activity:", error);
    throw error;
  }
};

export default {
  getStravaLink,
  getStravaActivities,
  linkActivityToLightning,
  getLightningActivities,
  getUserLightningActivity,
};
