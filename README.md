# Chess Library

A chess library implementation with comprehensive test coverage and web-based game interface.

## Getting Started

### Launching the Project with Docker

To launch the project inside a Docker container using Docker Compose:

```bash
docker compose up
```

This will:
- Build and start the container
- Install all dependencies
- Start the web server and test editors
- Make the application available on the configured ports

### Playing the Game

Once the container is running, open in 2 tabs this URL (imit 2 players):

**http://localhost:3000**

## Running Tests

To run tests inside the Docker container:

1. **Enter the Docker container:**
   ```bash
   docker compose exec web sh
   ```

2. **Navigate to the library folder:**
   ```bash
   cd library
   ```

3. **Run the tests:**
   ```bash
   npm test
   ```

   Or to run tests with coverage:
   ```bash
   npm run test:coverage
   ```

Note: the command "npm test" runs all tests including E2E tests that use server on port 3000. Tests will fail if this server does not run.

## Test Structure

### JSON Test Files

Many tests in this project are stored as JSON files. These test files contain board states, move configurations, and expected outcomes, making it easy to create and maintain test cases.

**Test files are located in:** `library/tests/boards/`

The test files are organized by functionality:
- `findAllPossibleMoves/` - Tests for finding all possible moves for each piece type
- `GameClassTests/` - Tests for game logic including castling, en passant, promotion, stalemate, etc.
- `isKingInCheck/` - Tests for check detection
- `isSquareAttacked/` - Tests for square attack detection
- `tryToMove/` - Tests for move validation
- And many more...

### Adding Tests Using the Test Editors

The project includes two web-based editors that allow you to create and edit test JSON files visually:

#### Port 3001
- **URL:** http://localhost:3001

#### Port 3002
- **URL:** http://localhost:3002

The editors make it easy to create complex test scenarios without manually writing JSON, ensuring that tests are accurate and comprehensive.

## Ports

- **3000** - Main chess game web interface
- **3001** - Mock board editor (React app)
- **3002** - Mock editor API server

