from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_add_indexes_constraints_fix_behaviorevt'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DELETE FROM api_message
                WHERE conversation_id IN (
                    SELECT c.id FROM api_conversation c
                    INNER JOIN api_referral r ON c.referral_id = r.id
                    WHERE r.id NOT IN (
                        SELECT MIN(id)
                        FROM api_referral
                        GROUP BY seeker_id, referrer_id, company_id
                    )
                );

                DELETE FROM api_conversation
                WHERE referral_id NOT IN (
                    SELECT MIN(id)
                    FROM api_referral
                    GROUP BY seeker_id, referrer_id, company_id
                );

                DELETE FROM api_referral
                WHERE id NOT IN (
                    SELECT MIN(id)
                    FROM api_referral
                    GROUP BY seeker_id, referrer_id, company_id
                );
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
