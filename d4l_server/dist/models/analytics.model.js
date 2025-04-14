"use strict";
/**
 * Analytics data models for the D4L platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEventType = void 0;
// Event types for analytics
var AnalyticsEventType;
(function (AnalyticsEventType) {
    // Contract events
    AnalyticsEventType["CONTRACT_INTERACTION"] = "contract_interaction";
    AnalyticsEventType["TOKEN_TRANSFER"] = "token_transfer";
    AnalyticsEventType["ASSET_LINKED"] = "asset_linked";
    AnalyticsEventType["ASSET_UNLINKED"] = "asset_unlinked";
    AnalyticsEventType["ASSET_TRANSFERRED"] = "asset_transferred";
    AnalyticsEventType["ROUTE_EXECUTED"] = "route_executed";
    AnalyticsEventType["ROUTE_REGISTERED"] = "route_registered";
    AnalyticsEventType["USER_REGISTERED"] = "user_registered";
    AnalyticsEventType["USER_LOGGED_IN"] = "user_logged_in";
    AnalyticsEventType["USER_LOGGED_OUT"] = "user_logged_out";
    AnalyticsEventType["AIRDROP_CLAIMED"] = "airdrop_claimed";
    AnalyticsEventType["NFT_MINTED"] = "nft_minted";
    // User interface events
    AnalyticsEventType["PAGE_VIEW"] = "page_view";
    AnalyticsEventType["BUTTON_CLICK"] = "button_click";
    AnalyticsEventType["FORM_SUBMISSION"] = "form_submission";
    AnalyticsEventType["WALLET_CONNECTED"] = "wallet_connected";
    AnalyticsEventType["WALLET_DISCONNECTED"] = "wallet_disconnected";
    AnalyticsEventType["ERROR_OCCURRED"] = "error_occurred";
    AnalyticsEventType["FEATURE_USED"] = "feature_used";
})(AnalyticsEventType || (exports.AnalyticsEventType = AnalyticsEventType = {}));
//# sourceMappingURL=analytics.model.js.map