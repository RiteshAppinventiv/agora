"use strict";

/**
 * v1 routes
 */

// admin routes
// import { adminRoute as adminRouteV1 } from "@routes/v1/adminRoute";
// category routes
// import { categoryRoute as categoryRouteV1 } from "@routes/v1/categoryRoute";
// common routes
// import { commonRoute as commonRouteV1 } from "@routes/v1/commonRoute";
// content routes
// import { contentRoute as contentRouteV1 } from "@routes/v1/contentRoute";
// group routes

// import { notificationRoute as notificationRouteV1 } from "@routes/v1/notificationRoute";
// participant routes

import { userRoute as userRouteV1 } from "@routes/v1/userRoute";
// version routes
// import { versionRoute as versionRouteV1 } from "@routes/v1/versionRoute";

// import { roleRoute as roleRouteV1 } from "@routes/v1/roleRoute";

export const routes: any = [

	// ...adminRouteV1,
	// ...categoryRouteV1,
	// ...commonRouteV1,
	// ...contentRouteV1,

	// ...notificationRouteV1,

	...userRouteV1,
	// ...versionRouteV1,
	// ...roleRouteV1
];