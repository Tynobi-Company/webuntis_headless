# WebUntis NodeJS API Wrapper

Welcome to the WebUntis API Wrapper! This Node.js TypeScript library allows you to seamlessly integrate WebUntis into your projects

## Installation

```bash
npm install webuntis_headless
```

## Getting Started

1. Install the `webuntis_headless` library in your project.
2. Start using the WebUntis Headless API in your Node.js TypeScript application!

```typescript
import { SetSchool, SetBaseUrl, SetUser, SetPassword } from "webuntis_headless";

SetSchool("yourschoolname")
SetBaseUrl("yourbaseurl") // e.g. borys.webuntis.com

SetUser("yourusername")
SetPassword("yourpassword")
```

## Functions

```typescript
// Get the current session or request a new one (With session validation)
async GetSession()

// Logout the current session
async Logout()

// Generate a new JWT Token from the session
async GetJwtToken()

// Get a timetable of a date range
async GetTimeTable(startDate?: Date, endDate?: Date)

// Fetch lesson details
async FetchCalendarEntryDetails(lesson: Lesson)
```

## Contributing

We welcome contributions from the community! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure tests pass.
4. Submit a pull request with a clear description of your changes.

## Documentation

WebUntis does not provide a offical documentation. For JSON RPC usage see this [PDF](https://untis-sr.ch/wp-content/uploads/2019/11/2018-09-20-WebUntis_JSON_RPC_API.pdf) file.

## Support

If you have questions or need assistance, feel free to [open an issue](https://github.com/grp-gg/webuntis_headless/issues) on the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy coding! 🚀