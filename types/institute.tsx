import { Timestamp } from "firebase/firestore";

export interface NewInstituteType {
  InstituteEmailAddress?: string
  InstituteImagePath?: string
  InstituteImageUrl?: string
  InstituteLastUpdateTimestamp?: Timestamp
  InstituteLocation?: string
  InstituteName?: string
  InstitutePhoneNumber?: string
  InstituteImageName?: string
  id?: string
}

export interface NewProgrammeType {
  InstituteName?: string
  ProgrammeCategory?: string
  ProgrammeDuration?: string
  ProgrammeLastUpdateTimestamp?: Timestamp
  ProgrammeMinimumEntryRequirements?: Map<string, string>
  ProgrammeName?: string
  ProgrammePrice?: number
  ProgrammeStudyLevel?: string
  id?: string

}