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
	const headers = { 'Content-Type': 'application/json', ...options.headers };
	return new Response(JSON.stringify(data), { ...options, headers });
};

/**
 * Handles the logic for the /api/travel_plan endpoint.
 * @param {Request} request The incoming request object.
 * @returns {Response} The response to send back.
 */
function handleTravelPlanRequest(request) {
	const url = new URL(request.url);
	const { searchParams } = url;

	// Get the parameters from the query string
	const duration = searchParams.get('duration');
	const escapeType = searchParams.get('escapeType');
	const accommodation = searchParams.get('accommodation');

	// Basic validation to ensure all required parameters are present
	if (!duration || !escapeType || !accommodation) {
		return jsonResponse({ error: 'Missing required parameters. Please provide duration, escapeType, and accommodation.' }, { status: 400 });
	}

	// The parameters are available here to generate a dynamic itinerary if needed
	console.log('Received travel preferences:', { duration, escapeType, accommodation });

	// Send the static JSON response
	return jsonResponse({
		message: "Here is your suggested itinerary for your upcoming escape. Enjoy your vacation."
	});
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const res_headers = new Headers({
			"Content-Type": "application/json; charset=utf-8",
			"Access-Control-Allow-Origin": "*"
		});

		// Basic routing
		if (url.pathname === '/api/travel_plan' && request.method === 'GET') {
			return handleTravelPlanRequest(request, res_headers);
		}

		if (url.pathname === '/') {
			return new Response('API Server is running. Try making a request to /api/travel_plan', res_headers);
		}

		res_headers.append("status", 404);
		return new Response('Not Found', res_headers);
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