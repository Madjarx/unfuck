import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";


/** Load the ENV */
config({
    path: require("path").resolve(__dirname, "../../.env")
});

const defaultUrl = "";
const defaultAnonKey = "";


/** Create the client */
export const dbClient = createClient(
    process.env.SUPABASE_URL || defaultUrl,
    process.env.SUPABASE_ANON_KEY || defaultAnonKey
)


