import type { Account, CurrentVisitorsResponse, Event, Site } from "../src/types/entities";

export const accountFixture = {
	id: "ACC123",
	object: "account",
	name: "Ada Lovelace",
	email: "ada@example.com",
} satisfies Account;

export const siteFixture = {
	id: "ABCDEF",
	object: "site",
	name: "Test Site",
	sharing: "none",
	created_at: "2022-01-01 12:00:00",
} satisfies Site;

export const eventFixture = {
	id: "EV123",
	object: "event",
	name: "Newsletter Signup",
	site_id: "ABCDEF",
	created_at: "2022-01-01 12:00:00",
} satisfies Event;

export const currentVisitorsFixture = {
	total: 3,
	content: [{ pathname: "/", hostname: "example.com", total: 2 }],
	referrers: [{ referrer_hostname: "google.com", referrer_pathname: "/search", total: 1 }],
} satisfies CurrentVisitorsResponse;

export function listResponse<T>(url: string, data: T[], hasMore = false) {
	return {
		object: "list" as const,
		url,
		has_more: hasMore,
		data,
	};
}

export function siteWith(id: string, name = `Site ${id}`): Site {
	return { ...siteFixture, id, name };
}

export function eventWith(id: string, name = `Event ${id}`): Event {
	return { ...eventFixture, id, name };
}
