import * as agora from "agora-access-token";
import {SERVER} from "./../config/environment";

const agoraToken= async(params: UserRequest.AgoraToken) => {
  try {
    const appID = SERVER.AGORA.APP_ID;
    const appCertificate = SERVER.AGORA.APP_CERT;
    const channelName = params.agoraChannelName?params.agoraChannelName:"RCC_Node_Agora";
    const uid = params.uid?params.uid:2882341273;
    const account = params.account?params.account:"2882341273";
    const role = params.role?agora.RtcRole.PUBLISHER:agora.RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = params.expirationTimeInSeconds?params.expirationTimeInSeconds:3600; 
    const currentTimestamp = Math.floor(Date.now() / 1000);    
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;  
    console.log('1',channelName,uid,account,role,expirationTimeInSeconds,currentTimestamp,privilegeExpiredTs)
    const tokenUid = agora.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + tokenUid);
    
    // Build token with user account
    const tokenAccount = agora.RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, account, role, privilegeExpiredTs);
    console.log("Token With UserAccount: " + tokenAccount);
    return {
      tokenUid: tokenUid,
      tokenAccount:tokenAccount
    }
  }catch(err){
    console.log(`catch block error in [agoraToken]`,err);
    throw err;
  }
}

export {agoraToken};