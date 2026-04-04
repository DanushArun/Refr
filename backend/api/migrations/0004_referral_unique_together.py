from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_dedup_and_unique_referral'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='referral',
            unique_together={('seeker', 'referrer', 'company')},
        ),
    ]
