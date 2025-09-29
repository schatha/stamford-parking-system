#!/bin/bash

# Railway Setup Script for Stamford Parking System
# This script automates the Railway deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Railway CLI is installed
check_railway_cli() {
    print_step "Checking Railway CLI installation..."
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed"
        echo "Install it with: npm install -g @railway/cli"
        exit 1
    fi
    print_success "Railway CLI is installed"
}

# Check if user is logged into Railway
check_railway_auth() {
    print_step "Checking Railway authentication..."
    if ! railway whoami &> /dev/null; then
        print_error "Not logged into Railway"
        echo "Run: railway login"
        exit 1
    fi
    print_success "Logged into Railway"
}

# Create new Railway project
create_project() {
    print_step "Creating Railway project..."

    read -p "Enter project name (default: stamford-parking): " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-stamford-parking}

    if railway new "$PROJECT_NAME"; then
        print_success "Created project: $PROJECT_NAME"
    else
        print_error "Failed to create project"
        exit 1
    fi
}

# Add PostgreSQL database
add_database() {
    print_step "Adding PostgreSQL database..."

    if railway add postgresql; then
        print_success "PostgreSQL database added"
        sleep 3 # Wait for database to be ready
    else
        print_error "Failed to add PostgreSQL database"
        exit 1
    fi
}

# Set environment variables
set_environment_variables() {
    print_step "Setting up environment variables..."

    # Generate NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)

    # Get Railway app URL (will be available after first deploy)
    echo "We'll set NEXTAUTH_URL after deployment"

    # Set basic environment variables
    railway variables set NODE_ENV=production
    railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

    print_success "Basic environment variables set"
    print_warning "You'll need to set these manually later:"
    echo "  - NEXTAUTH_URL (after getting your Railway domain)"
    echo "  - STRIPE_PUBLISHABLE_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo "  - STRIPE_WEBHOOK_SECRET"
}

# Deploy application
deploy_application() {
    print_step "Deploying application..."

    if railway up; then
        print_success "Application deployed"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."

    # Wait a bit for deployment to complete
    sleep 10

    if railway run npx prisma migrate deploy; then
        print_success "Migrations completed"
    else
        print_error "Migration failed"
        print_warning "You may need to run this manually later:"
        echo "  railway run npx prisma migrate deploy"
    fi
}

# Seed database
seed_database() {
    print_step "Seeding database with demo data..."

    if railway run npm run db:seed; then
        print_success "Database seeded with demo data"
    else
        print_error "Database seeding failed"
        print_warning "You may need to run this manually later:"
        echo "  railway run npm run db:seed"
    fi
}

# Get deployment info
get_deployment_info() {
    print_step "Getting deployment information..."

    # Get the app URL
    APP_URL=$(railway status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)

    if [ -n "$APP_URL" ]; then
        print_success "Deployment complete!"
        echo ""
        echo "🌐 Application URL: $APP_URL"
        echo ""
        echo "📝 Demo Login Credentials:"
        echo "   Admin: admin@demo.com / admin123"
        echo "   User:  user@demo.com / demo123"
        echo ""
        echo "🔧 Next Steps:"
        echo "   1. Update NEXTAUTH_URL environment variable:"
        echo "      railway variables set NEXTAUTH_URL=$APP_URL"
        echo ""
        echo "   2. Configure Stripe keys (for payment processing):"
        echo "      railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_your_key"
        echo "      railway variables set STRIPE_SECRET_KEY=sk_test_your_secret"
        echo ""
        echo "   3. Test your deployment:"
        echo "      curl $APP_URL/api/health"
        echo ""
        print_success "Setup complete! 🎉"
    else
        print_warning "Could not retrieve app URL. Check Railway dashboard."
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "🚂 Railway Setup for Stamford Parking System"
    echo "=============================================="
    echo -e "${NC}"

    # Confirmation
    read -p "This will create a new Railway project and deploy the app. Continue? (y/N): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi

    # Run setup steps
    check_railway_cli
    check_railway_auth
    create_project
    add_database
    set_environment_variables
    deploy_application
    run_migrations
    seed_database
    get_deployment_info
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' INT

# Help function
show_help() {
    echo "Railway Setup Script for Stamford Parking System"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     Show this help message"
    echo "  --skip-db      Skip database operations (migrations/seeding)"
    echo "  --existing     Connect to existing Railway project"
    echo ""
    echo "This script will:"
    echo "  1. Create a new Railway project"
    echo "  2. Add PostgreSQL database"
    echo "  3. Set environment variables"
    echo "  4. Deploy the application"
    echo "  5. Run database migrations"
    echo "  6. Seed demo data"
    echo ""
    echo "Prerequisites:"
    echo "  - Railway CLI installed (npm install -g @railway/cli)"
    echo "  - Logged into Railway (railway login)"
    echo "  - Git repository with the application code"
}

# Parse command line arguments
SKIP_DB=false
EXISTING_PROJECT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --existing)
            EXISTING_PROJECT=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Modified main for existing projects
if [ "$EXISTING_PROJECT" = true ]; then
    echo -e "${BLUE}"
    echo "🚂 Railway Setup for Existing Project"
    echo "====================================="
    echo -e "${NC}"

    print_step "Connecting to existing project..."
    railway link

    if [ "$SKIP_DB" = false ]; then
        run_migrations
        seed_database
    fi

    get_deployment_info
else
    main
fi