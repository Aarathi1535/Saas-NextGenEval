
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qpkuwzpwveyuefroynkd.supabase.co';
const supabaseAnonKey = 'sb_publishable_OkZ699kqje8oQsZLAr6peQ_hHt188j8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
