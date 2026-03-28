import { DefaultResponse } from 'src/docs/default/default-response.swagger';

export class UploadZipcodeRulesResponse extends DefaultResponse {
  data?: { success: number; error: number };
}

export class UploadRulesResponse extends DefaultResponse {
  data?: { success: number; error: number };
}
