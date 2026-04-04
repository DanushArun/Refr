from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contentcard',
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterModelOptions(
            name='referral',
            options={'ordering': ['-requested_at']},
        ),
        # BehaviorEvent.card_id: drop UUID column, add BigInteger column
        migrations.RemoveField(
            model_name='behaviorevent',
            name='card_id',
        ),
        migrations.AddField(
            model_name='behaviorevent',
            name='card_id',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='behaviorevent',
            name='event_type',
            field=models.CharField(db_index=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='behaviorevent',
            name='timestamp',
            field=models.DateTimeField(db_index=True),
        ),
        migrations.AlterField(
            model_name='contentcard',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='contentcard',
            name='is_removed',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='contentcard',
            name='type',
            field=models.CharField(
                choices=[
                    ('career_story', 'Career Story'),
                    ('company_intel', 'Company Intel'),
                    ('referral_event', 'Referral Event'),
                    ('milestone', 'Milestone'),
                    ('editorial', 'Editorial'),
                ],
                db_index=True,
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name='referral',
            name='requested_at',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='referral',
            name='status',
            field=models.CharField(
                choices=[
                    ('requested', 'Requested'),
                    ('accepted', 'Accepted'),
                    ('submitted', 'Submitted'),
                    ('interviewing', 'Interviewing'),
                    ('hired', 'Hired'),
                    ('rejected', 'Rejected'),
                    ('withdrawn', 'Withdrawn'),
                    ('expired', 'Expired'),
                ],
                db_index=True,
                default='requested',
                max_length=20,
            ),
        ),
    ]
