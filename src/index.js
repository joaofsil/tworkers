/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */



// Helper function to create a JSON response.
const jsonResponse = (data, options = {}) => {
	const headers = { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*", ...options.headers };
	return new Response(JSON.stringify(data), { ...options, headers });
};

async function call_ai_agent(env, params) {
	const res = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		messages: [
			{"role": "user", "content": "I want to go on a small vacation and I need your help in planning the trip. Please suggest a travel plan for a duration of " + params.duration + " to visit " + params.escapeType + " and I for accommodations I want suggestions for " + params.accommodation + " in Portugal and for a budget of 2000€"}
		]
	});

	return (res);
}

/**
 * Handles the logic for the /api/travel_plan endpoint.
 * @param {Request} request The incoming request object.
 * @returns {Response} The response to send back.
 */
async function handleTravelPlanRequest(env, request) {
	const url = new URL(request.url);
	const { searchParams } = url;

	// Get the parameters from the query string
	const duration = searchParams.get('duration');
	const escapeType = searchParams.get('escapeType');
	const accommodation = searchParams.get('accommodation');

	// Basic validation to ensure all required parameters are present
	if (!duration || !escapeType || !accommodation) {
		return jsonResponse( { message: 'Missing required parameters. Please provide duration, escapeType, and accommodation.' }, { "status": 404 });
	}

	// The parameters are available here to generate a dynamic itinerary if needed
	console.log('Received travel preferences:', { duration, escapeType, accommodation });

	const json_plan = await call_ai_agent(env, searchParams);
	const plan = json_plan.response;

	// Send the static JSON response
	return jsonResponse({
		message: "Here is your suggested itinerary for your upcoming escape. Enjoy your vacation. " + plan
	});
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		let res_headers = new Headers();
		res_headers.append("Content-Type", "application/json; charset=utf-8");
		res_headers.append("Access-Control-Allow-Origin", "*");

		// Basic routing
		if (url.pathname === '/api/travel_plan' && request.method === 'GET') {
			return handleTravelPlanRequest(env, request);
		}

		if (url.pathname === '/') {
			return new Response(JSON.stringify({message: 'API Server is running. Try making a request to /api/travel_plan'}), { headers: res_headers });
		}

		res_headers.append("status", 404);
		return new Response(JSON.stringify({message: 'Not Found'}), { headers: res_headers });
	},
};

/*
export default {
	async fetch(request, env, ctx) {
		return new Response('{"response": "<html><body>Hello Workers! <BR />' +
		'<a href=\'https://tworkers.joao-sil.workers.dev/api\'>API call</a> <BR />' +
		'</body></html>"}'
		, { headers: new Headers({
			"Content-Type": "application/json; charset=utf-8", 
			"Access-Control-Allow-Origin": "*"
			})
		});
	},
};
*/