"""
Seed the database with realistic Bangalore tech data for local testing.

Usage: python manage.py seed_data
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import (
    User, Company, SeekerProfile, ReferrerProfile,
    ContentCard, Referral, Conversation, Message,
)


COMPANIES = [
    {'name': 'Zepto', 'domain': 'zepto.co', 'employee_count_range': '1000-5000'},
    {'name': 'Razorpay', 'domain': 'razorpay.com', 'employee_count_range': '2000-5000'},
    {'name': 'Swiggy', 'domain': 'swiggy.in', 'employee_count_range': '5000-10000'},
    {'name': 'Flipkart', 'domain': 'flipkart.com', 'employee_count_range': '10000+'},
    {'name': 'PhonePe', 'domain': 'phonepe.com', 'employee_count_range': '5000-10000'},
    {'name': 'CRED', 'domain': 'cred.club', 'employee_count_range': '500-1000'},
    {'name': 'Meesho', 'domain': 'meesho.com', 'employee_count_range': '2000-5000'},
    {'name': 'Groww', 'domain': 'groww.in', 'employee_count_range': '1000-5000'},
    {'name': 'Coinbase India', 'domain': 'coinbase.com', 'employee_count_range': '500-1000'},
    {'name': 'Google Bangalore', 'domain': 'google.com', 'employee_count_range': '10000+'},
    {'name': 'Microsoft IDC', 'domain': 'microsoft.com', 'employee_count_range': '10000+'},
    {'name': 'Atlassian India', 'domain': 'atlassian.com', 'employee_count_range': '2000-5000'},
]

SEEKER_DATA = [
    {
        'display_name': 'Danush Arun',
        'email': 'danush@gmail.com',
        'headline': 'Backend engineer, 4y at Flipkart, moving to fintech',
        'career_story': 'Built the order management microservice handling 2M orders/day at Flipkart. Looking for a fintech company where I can work on payments infrastructure. Left Flipkart because I want to own something end-to-end, not just maintain a cog.',
        'skills': ['Node.js', 'PostgreSQL', 'System Design', 'Kafka', 'Redis', 'Go'],
        'years_of_experience': 4,
        'current_company': 'Flipkart',
        'target_companies': ['Razorpay', 'PhonePe', 'CRED', 'Groww'],
        'target_roles': ['Senior Backend Engineer', 'Platform Engineer'],
    },
    {
        'display_name': 'Priya Nair',
        'email': 'priya.nair@gmail.com',
        'headline': 'Full-stack dev, ex-Infosys, want to join a startup',
        'career_story': 'Spent 2 years at Infosys doing enterprise Java. Self-taught React and Node.js on weekends. Built a side project (task manager app) with 500 users. Ready for the startup world -- I learn fast and ship faster.',
        'skills': ['React', 'Node.js', 'TypeScript', 'Java', 'MongoDB', 'AWS'],
        'years_of_experience': 2,
        'current_company': 'Infosys',
        'target_companies': ['Zepto', 'Meesho', 'Swiggy', 'CRED'],
        'target_roles': ['Frontend Engineer', 'Full-stack Engineer'],
    },
    {
        'display_name': 'Vikram Reddy',
        'email': 'vikram.r@gmail.com',
        'headline': 'ML engineer at a Series A, looking for bigger data problems',
        'career_story': 'Built recommendation engine at a small e-commerce startup. 15% uplift in conversion. But we have limited data -- I want to work at scale. Interested in search relevance, personalization at companies with millions of users.',
        'skills': ['Python', 'PyTorch', 'TensorFlow', 'Spark', 'SQL', 'MLOps', 'Kubernetes'],
        'years_of_experience': 3,
        'current_company': '',
        'target_companies': ['Flipkart', 'Swiggy', 'Google Bangalore', 'Meesho'],
        'target_roles': ['ML Engineer', 'Data Scientist', 'Applied Scientist'],
    },
    {
        'display_name': 'Sneha Kulkarni',
        'email': 'sneha.k@gmail.com',
        'headline': 'iOS dev, 6y experience, looking for greenfield projects',
        'career_story': 'Lead iOS engineer at a health-tech startup. Shipped 3 apps from scratch. Burned out maintaining legacy codebases -- want a team that builds new things. Interested in consumer apps with great design.',
        'skills': ['Swift', 'SwiftUI', 'React Native', 'Firebase', 'CI/CD', 'Figma'],
        'years_of_experience': 6,
        'current_company': '',
        'target_companies': ['CRED', 'PhonePe', 'Zepto', 'Groww'],
        'target_roles': ['Senior iOS Engineer', 'Mobile Lead'],
    },
    {
        'display_name': 'Rahul Deshmukh',
        'email': 'rahul.d@gmail.com',
        'headline': 'DevOps/SRE, 5y, want to move from ops to platform engineering',
        'career_story': 'Managing 200+ microservices at a mid-size fintech. On-call fatigue is real. Want to shift from reactive firefighting to building internal developer platforms. Interested in companies that treat infra as a product.',
        'skills': ['Kubernetes', 'Terraform', 'AWS', 'Go', 'Prometheus', 'ArgoCD'],
        'years_of_experience': 5,
        'current_company': '',
        'target_companies': ['Razorpay', 'Atlassian India', 'Google Bangalore', 'Microsoft IDC'],
        'target_roles': ['Platform Engineer', 'SRE', 'Staff Engineer'],
    },
    {
        'display_name': 'Ananya Sharma',
        'email': 'ananya.s@gmail.com',
        'headline': 'Fresh CS grad from IIIT-B, strong in DSA and system design',
        'career_story': 'Graduated top of class at IIIT Bangalore. Won 3 hackathons. Interned at a YC startup building a distributed cache. Looking for my first full-time role where I can learn from senior engineers.',
        'skills': ['C++', 'Python', 'React', 'System Design', 'Distributed Systems'],
        'years_of_experience': 0,
        'current_company': '',
        'target_companies': ['Google Bangalore', 'Microsoft IDC', 'Atlassian India', 'Razorpay'],
        'target_roles': ['Software Engineer', 'Backend Engineer'],
    },
    {
        'display_name': 'Karthik Iyer',
        'email': 'karthik.i@gmail.com',
        'headline': 'Android dev at Swiggy, 3y, exploring cross-platform',
        'career_story': 'Built Swiggy delivery partner app features. Kotlin + Compose. But honestly? I think the future is cross-platform. Learning Flutter and React Native. Want a company that lets me experiment.',
        'skills': ['Kotlin', 'Jetpack Compose', 'Flutter', 'React Native', 'Firebase'],
        'years_of_experience': 3,
        'current_company': 'Swiggy',
        'target_companies': ['CRED', 'PhonePe', 'Coinbase India', 'Zepto'],
        'target_roles': ['Mobile Engineer', 'Cross-platform Engineer'],
    },
    {
        'display_name': 'Divya Menon',
        'email': 'divya.m@gmail.com',
        'headline': 'Data engineer, 4y, transitioning from analytics to engineering',
        'career_story': 'Built data pipelines at a logistics startup. Moved from Tableau/SQL analyst role to proper engineering with Spark and Airflow. Want a company where data engineering is a first-class citizen, not an afterthought.',
        'skills': ['Python', 'Spark', 'Airflow', 'dbt', 'BigQuery', 'Kafka', 'SQL'],
        'years_of_experience': 4,
        'current_company': '',
        'target_companies': ['Flipkart', 'Swiggy', 'Meesho', 'Groww'],
        'target_roles': ['Senior Data Engineer', 'Analytics Engineer'],
    },
    {
        'display_name': 'Rohan Bhat',
        'email': 'rohan.bhat@gmail.com',
        'headline': 'SRE at Uber India. Exploring platform engineering roles.',
        'career_story': '4 years on-call at Uber. Shipped the multi-region failover playbook. Tired of reactive work. Want to move into platform engineering where I build for other engineers rather than firefight.',
        'skills': ['Kubernetes', 'Terraform', 'Go', 'Prometheus', 'ArgoCD'],
        'years_of_experience': 6,
        'current_company': 'Uber India',
        'target_companies': ['Razorpay', 'Atlassian India', 'Google Bangalore'],
        'target_roles': ['Platform Engineer', 'Staff Engineer'],
    },
    {
        'display_name': 'Aditi Sharma',
        'email': 'aditi.sharma@gmail.com',
        'headline': 'PM at Swiggy Instamart. Ready to own a 0 to 1 product.',
        'career_story': '3 years at Swiggy, the last year running Instamart grocery category. Looking for a product role where I go end-to-end from strategy to launch. Bonus for consumer fintech.',
        'skills': ['Product Strategy', 'SQL', 'A/B testing', 'Figma', 'Mixpanel'],
        'years_of_experience': 4,
        'current_company': 'Swiggy',
        'target_companies': ['CRED', 'PhonePe', 'Zepto'],
        'target_roles': ['Senior Product Manager', 'Product Lead'],
    },
    {
        'display_name': 'Nikhil Rao',
        'email': 'nikhil.rao@gmail.com',
        'headline': 'ML engineer. Ranking systems at scale. Want bigger data.',
        'career_story': '3 years at InMobi building ad ranking models. Moved 5% of the global ad revenue needle last year. Looking for scale problems at consumer companies where ML drives the core product.',
        'skills': ['Python', 'PyTorch', 'Spark', 'SQL', 'MLOps'],
        'years_of_experience': 4,
        'current_company': 'InMobi',
        'target_companies': ['Flipkart', 'Swiggy', 'Google Bangalore'],
        'target_roles': ['ML Engineer', 'Applied Scientist'],
    },
    {
        'display_name': 'Shreya Nair',
        'email': 'shreya.nair@gmail.com',
        'headline': 'Full-stack at Zerodha. Curious about non-broker fintech.',
        'career_story': '3 years at Zerodha building Kite web. Deep exposure to trading systems. Want to see how fintech outside broking looks -- lending, cards, payments. Stack-agnostic but love TypeScript end to end.',
        'skills': ['TypeScript', 'React', 'Node', 'PostgreSQL', 'WebSockets'],
        'years_of_experience': 3,
        'current_company': 'Zerodha',
        'target_companies': ['Razorpay', 'Groww', 'CRED'],
        'target_roles': ['Senior Full-stack Engineer', 'Product Engineer'],
    },
    {
        'display_name': 'Meera Iyer',
        'email': 'meera.iyer@gmail.com',
        'headline': 'Payments engineer tired of legacy code. Want greenfield.',
        'career_story': '3 years at PhonePe building merchant onboarding. I learned a lot but the codebase is 8 years old and change velocity is brutal. Looking for fintech teams where I can ship weekly.',
        'skills': ['Go', 'Kafka', 'PostgreSQL', 'gRPC', 'Kubernetes'],
        'years_of_experience': 4,
        'current_company': 'PhonePe',
        'target_companies': ['Razorpay', 'CRED', 'Groww'],
        'target_roles': ['Senior Backend Engineer'],
    },
]

REFERRER_DATA = [
    {
        'display_name': 'Nivrant Goswami',
        'email': 'danush@razorpay.com',
        'company': 'Razorpay',
        'department': 'Engineering',
        'job_title': 'Staff Engineer',
        'years_at_company': 4,
        'can_refer_to': ['Backend', 'Platform', 'Payments'],
        'kingmaker_score': 45,
        'total_referrals': 12,
        'successful_hires': 3,
    },
    {
        'display_name': 'Meera Patel',
        'email': 'meera@swiggy.in',
        'company': 'Swiggy',
        'department': 'Engineering',
        'job_title': 'Engineering Manager',
        'years_at_company': 3,
        'can_refer_to': ['Backend', 'Frontend', 'Data'],
        'kingmaker_score': 62,
        'total_referrals': 18,
        'successful_hires': 5,
    },
    {
        'display_name': 'Aditya Joshi',
        'email': 'aditya@cred.club',
        'company': 'CRED',
        'department': 'Product Engineering',
        'job_title': 'Senior Software Engineer',
        'years_at_company': 2,
        'can_refer_to': ['iOS', 'Android', 'Backend', 'Design'],
        'kingmaker_score': 28,
        'total_referrals': 8,
        'successful_hires': 2,
    },
    {
        'display_name': 'Lakshmi Narayan',
        'email': 'lakshmi@zepto.co',
        'company': 'Zepto',
        'department': 'Engineering',
        'job_title': 'Principal Engineer',
        'years_at_company': 2,
        'can_refer_to': ['Backend', 'Infrastructure', 'Mobile'],
        'kingmaker_score': 38,
        'total_referrals': 10,
        'successful_hires': 3,
    },
    {
        'display_name': 'Suresh Menon',
        'email': 'suresh@phonepe.com',
        'company': 'PhonePe',
        'department': 'Platform',
        'job_title': 'Tech Lead',
        'years_at_company': 5,
        'can_refer_to': ['Platform', 'SRE', 'Backend', 'Payments'],
        'kingmaker_score': 71,
        'total_referrals': 22,
        'successful_hires': 6,
    },
    {
        'display_name': 'Neha Gupta',
        'email': 'neha@google.com',
        'company': 'Google Bangalore',
        'department': 'Search',
        'job_title': 'Senior Software Engineer',
        'years_at_company': 3,
        'can_refer_to': ['Software Engineer', 'ML Engineer', 'SRE'],
        'kingmaker_score': 55,
        'total_referrals': 15,
        'successful_hires': 4,
    },
    {
        'display_name': 'Amit Verma',
        'email': 'amit@flipkart.com',
        'company': 'Flipkart',
        'department': 'Marketplace',
        'job_title': 'Senior Engineer',
        'years_at_company': 4,
        'can_refer_to': ['Backend', 'Data', 'Frontend', 'DevOps'],
        'kingmaker_score': 33,
        'total_referrals': 9,
        'successful_hires': 2,
    },
    {
        'display_name': 'Priya Sharma',
        'email': 'priya.sharma@flipkart.com',
        'company': 'Flipkart',
        'department': 'Engineering',
        'job_title': 'Sr Engineering Manager',
        'years_at_company': 5,
        'can_refer_to': ['Backend', 'Platform', 'Frontend'],
        'kingmaker_score': 72,
        'total_referrals': 24,
        'successful_hires': 8,
    },
    {
        'display_name': 'Rajesh Iyer',
        'email': 'rajesh@meesho.com',
        'company': 'Meesho',
        'department': 'Engineering',
        'job_title': 'VP Engineering',
        'years_at_company': 3,
        'can_refer_to': ['Backend', 'Platform', 'Product', 'Data'],
        'kingmaker_score': 28,
        'total_referrals': 9,
        'successful_hires': 2,
    },
    {
        'display_name': 'Nandini Krishnan',
        'email': 'nandini@groww.in',
        'company': 'Groww',
        'department': 'Data Science',
        'job_title': 'Data Science Lead',
        'years_at_company': 2,
        'can_refer_to': ['ML', 'Data', 'Backend'],
        'kingmaker_score': 22,
        'total_referrals': 7,
        'successful_hires': 1,
    },
    {
        'display_name': 'Kavya Reddy',
        'email': 'kavya@microsoft.com',
        'company': 'Microsoft IDC',
        'department': 'Azure',
        'job_title': 'Principal Engineer',
        'years_at_company': 4,
        'can_refer_to': ['Backend', 'Infrastructure', 'SRE'],
        'kingmaker_score': 19,
        'total_referrals': 6,
        'successful_hires': 1,
    },
    {
        'display_name': 'Ishaan Thakur',
        'email': 'ishaan@coinbase.com',
        'company': 'Coinbase India',
        'department': 'Engineering',
        'job_title': 'Senior Developer',
        'years_at_company': 1,
        'can_refer_to': ['Backend', 'Crypto', 'Infrastructure'],
        'kingmaker_score': 14,
        'total_referrals': 4,
        'successful_hires': 1,
    },
]

COMPANY_INTEL = [
    {
        'company': 'Razorpay',
        'title': 'Razorpay engineering culture: what nobody tells you',
        'body': 'The good: incredible autonomy, you own features end-to-end. The team is small enough that your code ships to millions of merchants within days. The not-so-good: on-call can be brutal during payment gateway outages -- think 2am pages during sale seasons. But honestly, the learning curve is worth it if you want to understand payments infrastructure deeply.',
        'tags': ['culture', 'payments', 'on-call'],
    },
    {
        'company': 'Swiggy',
        'title': 'Swiggy just restructured their eng teams -- here is what changed',
        'body': 'Major reorg happened last month. Supply chain and logistics teams merged. If you are interviewing for backend roles, know that they are consolidating microservices -- going from 300+ to about 150. Good news: they are hiring platform engineers to manage the migration. Bad news: some teams lost headcount.',
        'tags': ['reorg', 'hiring', 'platform'],
    },
    {
        'company': 'CRED',
        'title': 'What CRED looks for in mobile engineers (insider perspective)',
        'body': 'Design obsession is not a meme here. Your portfolio matters more than your DSA skills. They actually review your GitHub/Dribbble during the interview. The app team is small (under 30 people) so you will touch everything -- from animations to payment flows. Compensation is top of market for Bangalore.',
        'tags': ['interview', 'mobile', 'compensation'],
    },
    {
        'company': 'Zepto',
        'title': 'Zepto eng hiring bar: what I have seen as an interviewer',
        'body': 'We prioritize speed of execution over theoretical perfection. System design rounds focus on real problems -- like how to optimize delivery routing for 10-minute delivery. If you can think on your feet and have shipped production code at scale, you will do well. LeetCode hard is not the focus.',
        'tags': ['interview', 'system-design', 'hiring'],
    },
    {
        'company': 'PhonePe',
        'title': 'PhonePe platform team: the best-kept secret in Bangalore',
        'body': 'The platform team handles 12 billion+ transactions/year. The scale is genuinely insane. They use a mix of Java and Go, with Kafka handling 50K+ events/second. If you want distributed systems experience that rivals FAANG, this is it. Downside: the codebase is massive and onboarding takes 3-4 months.',
        'tags': ['scale', 'distributed-systems', 'platform'],
    },
    {
        'company': 'Google Bangalore',
        'title': 'Google Bangalore vs Google US: the real differences',
        'body': 'The Bangalore office handles production-critical search infrastructure, not just support work. You get the same codebase access as Mountain View. The L4-L5 promotion bar is identical globally. Main difference: the work-life balance is actually better here -- fewer meetings, more deep work time. TC is lower than US but among the highest in India.',
        'tags': ['comparison', 'compensation', 'work-life'],
    },
]

EDITORIAL_CONTENT = [
    {
        'title': 'The Bangalore hiring market in Q2 2026: what the data says',
        'body': 'Backend and platform engineering roles are up 40% from last quarter. ML/AI hiring has cooled slightly after the initial hype. Fintech companies (Razorpay, PhonePe, Groww) are the most aggressive hirers. Average time-to-hire for senior engineers: 18 days. The referral hire rate remains 3x higher than job board applications.',
        'author': 'REFR Editorial',
        'tags': ['market-trends', 'hiring', 'bangalore'],
    },
    {
        'title': 'Why your referral matters more than your resume',
        'body': 'Data from 500+ REFR referrals: candidates referred by current employees are 4.2x more likely to get an interview and 2.8x more likely to receive an offer. The reason is simple -- a referrer puts their reputation on the line. When Suresh at PhonePe refers you, his manager knows Suresh would not waste their time.',
        'author': 'REFR Editorial',
        'tags': ['referrals', 'data', 'career-advice'],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with realistic Bangalore tech data for local testing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')

        # Create companies
        companies = {}
        for data in COMPANIES:
            company, created = Company.objects.get_or_create(
                name=data['name'],
                defaults={
                    'domain': data['domain'],
                    'employee_count_range': data['employee_count_range'],
                },
            )
            companies[data['name']] = company
            if created:
                self.stdout.write(f'  Created company: {data["name"]}')

        # Create referrer users and profiles
        referrer_users = []
        for data in REFERRER_DATA:
            user, created = User.objects.get_or_create(
                username=data['email'],
                defaults={
                    'email': data['email'],
                    'display_name': data['display_name'],
                    'role': 'referrer',
                },
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'  Created referrer: {data["display_name"]}')

            company = companies.get(data['company'])
            if company:
                ReferrerProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'company': company,
                        'department': data['department'],
                        'job_title': data['job_title'],
                        'years_at_company': data['years_at_company'],
                        'can_refer_to': data['can_refer_to'],
                        'kingmaker_score': data['kingmaker_score'],
                        'total_referrals': data['total_referrals'],
                        'successful_hires': data['successful_hires'],
                        'verification_status': 'verified',
                    },
                )
            referrer_users.append(user)

        # Create seeker users and profiles
        seeker_users = []
        for data in SEEKER_DATA:
            user, created = User.objects.get_or_create(
                username=data['email'],
                defaults={
                    'email': data['email'],
                    'display_name': data['display_name'],
                    'role': 'seeker',
                },
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'  Created seeker: {data["display_name"]}')

            SeekerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'headline': data['headline'],
                    'career_story': data['career_story'],
                    'skills': data['skills'],
                    'years_of_experience': data['years_of_experience'],
                    'current_company': data.get('current_company', ''),
                    'target_companies': data['target_companies'],
                    'target_roles': data['target_roles'],
                },
            )
            seeker_users.append(user)

        # Create content cards: career stories from seekers
        now = timezone.now()
        cards_created = 0
        for i, (user, data) in enumerate(zip(seeker_users, SEEKER_DATA)):
            age_offset = timedelta(hours=random.randint(1, 72))
            _, created = ContentCard.objects.get_or_create(
                type='career_story',
                author=user,
                defaults={
                    'score': 0,
                    'reaction_count': random.randint(5, 120),
                    'payload': {
                        'seekerId': str(user.id),
                        'seekerName': data['display_name'],
                        'seekerAvatar': None,
                        'headline': data['headline'],
                        'story': data['career_story'],
                        'skills': data['skills'],
                        'yearsOfExperience': data['years_of_experience'],
                        'targetRoles': data['target_roles'],
                        'targetCompanies': data['target_companies'],
                    },
                    'created_at': now - age_offset,
                },
            )
            if created:
                cards_created += 1

        # Create content cards: company intel from referrers
        for i, intel in enumerate(COMPANY_INTEL):
            company = companies.get(intel['company'])
            referrer_user = next(
                (u for u, d in zip(referrer_users, REFERRER_DATA) if d['company'] == intel['company']),
                referrer_users[0],
            )
            age_offset = timedelta(hours=random.randint(2, 96))
            _, created = ContentCard.objects.get_or_create(
                type='company_intel',
                payload__title=intel['title'],
                defaults={
                    'author': referrer_user,
                    'company': company,
                    'score': 0,
                    'reaction_count': random.randint(20, 200),
                    'payload': {
                        'companyId': str(company.id) if company else '',
                        'companyName': intel['company'],
                        'companyLogo': None,
                        'authorLabel': f'Verified employee at {intel["company"]}',
                        'title': intel['title'],
                        'body': intel['body'],
                        'tags': intel['tags'],
                    },
                    'created_at': now - age_offset,
                },
            )
            if created:
                cards_created += 1

        # Create editorial content
        for editorial in EDITORIAL_CONTENT:
            age_offset = timedelta(hours=random.randint(4, 120))
            _, created = ContentCard.objects.get_or_create(
                type='editorial',
                payload__title=editorial['title'],
                defaults={
                    'score': 0,
                    'reaction_count': random.randint(50, 300),
                    'payload': {
                        'title': editorial['title'],
                        'body': editorial['body'],
                        'author': editorial['author'],
                        'tags': editorial['tags'],
                    },
                    'created_at': now - age_offset,
                },
            )
            if created:
                cards_created += 1

        self.stdout.write(f'  Created {cards_created} content cards')

        # Create some referrals in various states
        referrals_created = 0
        statuses = ['requested', 'accepted', 'submitted', 'interviewing', 'hired', 'rejected']

        for seeker_user, seeker_data in zip(seeker_users[:5], SEEKER_DATA[:5]):
            try:
                seeker_profile = seeker_user.seeker_profile
            except SeekerProfile.DoesNotExist:
                continue

            # Each seeker gets 1-3 referrals
            num_referrals = random.randint(1, 3)
            used_referrers = set()

            for _ in range(num_referrals):
                referrer_user = random.choice(referrer_users)
                if referrer_user.id in used_referrers:
                    continue
                used_referrers.add(referrer_user.id)

                try:
                    referrer_profile = referrer_user.referrer_profile
                except ReferrerProfile.DoesNotExist:
                    continue

                ref_status = random.choice(statuses)
                referral, created = Referral.objects.get_or_create(
                    seeker=seeker_profile,
                    referrer=referrer_profile,
                    defaults={
                        'company': referrer_profile.company,
                        'target_role': random.choice(seeker_data['target_roles']),
                        'status': ref_status,
                        'match_score': random.randint(60, 95),
                        'seeker_note': f'Hi, I am {seeker_data["display_name"]}. Would love a referral for this role!',
                        'accepted_at': now - timedelta(hours=random.randint(1, 48)) if ref_status in ('accepted', 'submitted', 'interviewing', 'hired') else None,
                        'submitted_at': now - timedelta(hours=random.randint(1, 24)) if ref_status in ('submitted', 'interviewing', 'hired') else None,
                        'interviewing_at': now - timedelta(hours=random.randint(1, 12)) if ref_status in ('interviewing', 'hired') else None,
                        'outcome_at': now - timedelta(hours=random.randint(1, 6)) if ref_status in ('hired', 'rejected') else None,
                    },
                )
                if created:
                    referrals_created += 1

                    # Create conversation with sample messages
                    conv, _ = Conversation.objects.get_or_create(referral=referral)
                    if ref_status in ('accepted', 'submitted', 'interviewing', 'hired'):
                        Message.objects.get_or_create(
                            conversation=conv,
                            sender=referrer_user,
                            defaults={
                                'body': f'Hi {seeker_data["display_name"]}! I have accepted your referral request. Let me know if you have any questions about the role.',
                            },
                        )
                        Message.objects.get_or_create(
                            conversation=conv,
                            sender=seeker_user,
                            defaults={
                                'body': f'Thank you so much! I am really excited about this opportunity at {referrer_profile.company.name}. What should I expect in the interview process?',
                            },
                        )

        self.stdout.write(f'  Created {referrals_created} referrals with conversations')

        # Create a referral event card for a recent hire
        hired_referrals = Referral.objects.filter(status='hired').select_related('seeker__user', 'referrer__user', 'company')[:2]
        for hr in hired_referrals:
            _, created = ContentCard.objects.get_or_create(
                type='referral_event',
                payload__seekerDisplayName=hr.seeker.user.display_name,
                defaults={
                    'score': 0,
                    'reaction_count': random.randint(30, 150),
                    'payload': {
                        'referrerDisplayName': hr.referrer.user.display_name,
                        'seekerDisplayName': hr.seeker.user.display_name,
                        'companyName': hr.company.name,
                        'eventDescription': f'{hr.seeker.user.display_name} was hired at {hr.company.name} through a referral by {hr.referrer.user.display_name}!',
                    },
                    'created_at': now - timedelta(hours=random.randint(1, 24)),
                },
            )

        # Summary
        self.stdout.write(self.style.SUCCESS(
            f'\nSeeding complete!\n'
            f'  Companies: {Company.objects.count()}\n'
            f'  Users: {User.objects.count()}\n'
            f'  Seeker profiles: {SeekerProfile.objects.count()}\n'
            f'  Referrer profiles: {ReferrerProfile.objects.count()}\n'
            f'  Content cards: {ContentCard.objects.count()}\n'
            f'  Referrals: {Referral.objects.count()}\n'
            f'  Conversations: {Conversation.objects.count()}\n'
            f'  Messages: {Message.objects.count()}\n'
            f'\nTest accounts (password: password123):\n'
            f'  Seeker:   danush@gmail.com\n'
            f'  Referrer: danush@razorpay.com\n'
            f'\nAdmin: python manage.py createsuperuser\n'
        ))
