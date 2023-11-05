import { Timestamp } from "firebase/firestore";

export interface NewInstituteType {
  InstituteEmailAddress?: string;
  InstituteImagePath?: string;
  InstituteImageUrl?: string;
  InstituteLastUpdateTimestamp?: Timestamp;
  InstituteLocation?: string;
  InstituteName?: string;
  InstitutePhoneNumber?: string;
  id?: string;
}