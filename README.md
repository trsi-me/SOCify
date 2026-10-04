# SOCify

## 1 ما هو المشروع

SOCify منصة ويب لمحاكاة مركز عمليات أمن سيبراني (SOC). تدير مستخدمين بأدوار، وأحداثاً أمنية، وقواعداً، ومصادر أحداث، وسجل تدقيق. الواجهة قوالب HTML، والبيانات في ملف SQLite اسمه `socify.db`. التعليق في `schema.sql`: Cybersecurity Operations Center Simulation Platform.

المنصة تسجّل أحداثاً يُنشئها المستخدم أو شاشة المختبر. لا يوجد في `app.py` ملتقط حزم ولا اتصال فعلي بجدران الحماية المذكورة كنصوص داخل البذور.

## 2 لمن هذا المشروع

| الدور في الجدول `users` | الاسم العربي في القالب | ما يفعله التسجيل |
| --- | --- | --- |
| `analyst` | محلل أمني | الدور الافتراضي عند `/register` |
| `soc_manager` | مدير SOC | يُنشئ ويعدّل القواعد والمصادر مع المدير |
| `admin` | مدير النظام | نفس صلاحيات مدير SOC على القواعد والمصادر |

الزائر غير المسجّل يرى الصفحة الرئيسية وصفحات الدخول والتسجيل والاختبار `/test`.

## 3 الميزات الفعلية

- صفحات: رئيسية، دخول، تسجيل، خروج، لوحة، مختبر، قواعد، ملف شخصي، صفحة اختبار `test.html`.
- أحداث أمنية مع تصفية الشدة والحالة والمصدر، وترقيم `limit` و`offset`.
- إنشاء وتعديل وحذف حدث مع سجل تدقيق.
- إحصاءات شدة وحالة وعدد أحداث الساعة الأخيرة.
- قواعد تُخزَّن شروطها وإجراءاتها كنص JSON.
- مصادر أحداث تُخزَّن باسم ونوع ونقطة نهاية وحقل مفتاح.
- مختبر يرسل حدثاً عبر `POST /api/lab/event` فيُحفظ في `security_events`.
- سكربتات بذر: `add_sample_data.py` و`quick_data.py` و`quick_fix_data.py`.
- تشغيل مساعد: `run.py` ينشئ القاعدة إن غابت ثم يشغّل الخادم.

تنفيذ تلقائي للقواعد على سيل أحداث خارجي: غير موجود في `app.py`. القواعد تُحفظ وتُقرأ. جدول `event_comments` موجود في المخطط ولا يوجد له مسار في `app.py`.

## 4 أمثلة واقعية

إنشاء حدث يتطلب JSON بالحقول `source` و`severity` و`category` و`title` و`description`. الحقل `raw_data` اختياري. المعرّف العام يُولَّد بالشكل `EVT-` ثم 8 خانات من UUID.

قيم الشدة المسموحة في قيد الجدول: `critical`, `high`, `medium`, `low`.

قيم الحالة: `open`, `investigating`, `resolved`, `false_positive`.

تعديل الحدث يقبل: `status`, `assigned_to`, `severity`, `title`, `description`.

تصفية القائمة: `GET /api/events?severity=high&status=open&source=Firewall-01&limit=50&offset=0`.

بذور `schema.sql` تدرج مصادر بأسماء Firewall-01 وIDS-01 وServer-Web-01 وServer-DB-01، ونقاط نهاية نصية مثل `http://firewall-01.local/api/logs`. هذه صفوف إعداد، والتطبيق لا يستدعي تلك العناوين في `app.py`.

## 5 رحلة الاستخدام

1. `python run.py` أو `python app.py`.
2. إن لم يوجد `socify.db` تُستدعى `init_db` التي تستدعي `create_db.create_database`.
3. المستخدم يفتح `http://localhost:5000` حسب رسالة `run.py`.
4. التسجيل ينشئ محللاً بكلمة مرور مرمزة بـ bcrypt.
5. الدخول يضع `user_id` و`user_email` و`user_name` و`user_role` في الجلسة ويحدّث `last_login` ويكتب تدقيقاً.
6. اللوحة تطلب `/api/stats` و`/api/events`.
7. مدير أو مدير SOC يضيف قاعدة أو مصدراً.
8. الخروج يمسح الجلسة بعد تدقيق تسجيل الخروج.

`run.py` يطبع في الطرفية حسابات تجريبية. القيم مكتوبة داخل `run.py` وداخل بذور الإنشاء. لا تُعاد في هذا الملف.

## 6 الوحدات البرمجية

| الملف | الدور |
| --- | --- |
| `app.py` | المسارات والجلسة وCSRF والتدقيق |
| `run.py` | فحص المجلد وإنشاء القاعدة ثم التشغيل |
| `create_db.py` | حذف القاعدة الحالية وإعادة بنائها مع بيانات |
| `schema.sql` | مخطط SQL وبذور |
| `init_db.py` | تهيئة إضافية |
| `add_sample_data.py` | أحداث وقواعد ومصادر ومستخدمون تجريبيون |
| `quick_data.py` و`quick_fix_data.py` | إدراج سريع |
| `templates/` | HTML |
| `static/css` و`static/js` | تنسيق وسلوك الصفحات |

## 7 الكيانات

| الجدول | الحقول الرئيسة |
| --- | --- |
| `users` | بريد فريد، `password_hash`، اسم، دور، فريق، `is_active`، `last_login` |
| `security_events` | `event_id` فريد، مصدر، شدة، فئة، عنوان، وصف، `raw_data`، حالة، `assigned_to`، `created_by` |
| `event_comments` | تعليق مرتبط بحدث ومستخدم. لا مسار API له في `app.py` |
| `rules` | اسم، نوع شرط، قيمة شرط، نوع إجراء، قيمة إجراء، `is_active`، `created_by` |
| `audit_logs` | مستخدم، إجراء، جدول، سجل، قيم قديمة وجديدة، عنوان IP، وكيل المتصفح |
| `event_sources` | اسم، نوع، `endpoint`، `api_key`، نشاط، `last_sync` |

فهارس في `schema.sql`: البريد، الدور، شدة الحدث، حالته، وقته، مصدره، مستخدم التدقيق، وقت التدقيق.

`create_db.py` يحذف `socify.db` إن وُجد ثم يعيد الإنشاء. استدعاؤه من `init_db` يعني أن أول تشغيل عبر `app.init_db` يعيد بناء الملف.

## 8 الصلاحيات

| المسار | الشرط |
| --- | --- |
| `/` و`/test` و`/login` و`/register` | مفتوح |
| `/lab` و`/rules` و`/profile` و`/dashboard` | `login_required` |
| `GET/POST /api/events` و`PUT/DELETE` حدث و`GET /api/audit` و`GET /api/rules` و`GET /api/sources` و`GET /api/stats` و`POST /api/lab/event` | `login_required` |
| `POST/PUT /api/rules` و`POST/PUT /api/sources` | `role_required` للأدوار `soc_manager` و`admin` |

`role_required` يتحقق من الجلسة ثم يقرأ الدور من القاعدة. الدور غير المدرج في القائمة يرجع 403 للطلبات JSON أو رسالة فلاش وإعادة توجيه إلى اللوحة.

حذف الأحداث وتعديلها متاح لكل مستخدم مسجّل، بلا فحص دور إضافي في الدالة.

## 9 الأتمتة

| السلوك | الحالة |
| --- | --- |
| إنشاء القاعدة عند غياب الملف | في `app.py` و`run.py` |
| تدقيق الدخول والخروج والإنشاء والتعديل والحذف | `log_audit` |
| محرك يطبّق صفوف `rules` دورياً | غير موجود في الملفات الحالية |
| مزامنة `event_sources.endpoint` | غير موجود في الملفات الحالية. عمود `last_sync` موجود بلا تحديث في `app.py` |

## 10 التكامل

التكامل الداخلي: المتصفح مع قوالب Flask وطلبات JSON. حقل مصدر الحدث نص حر يخزّن اسم النظام المبلّغ. لا عميل HTTP يخرج إلى تلك الأنظمة داخل `app.py`.

`Flask-CORS` يسمح للأصل `http://localhost:5000` و`http://127.0.0.1:5000`.

## 11 المصطلحات

| المصطلح | المعنى في المشروع |
| --- | --- |
| SOC | مركز عمليات أمني، كما في وصف المخطط |
| event_id | معرّف نصي `EVT-` بالإضافة إلى جزء من UUID |
| false_positive | حالة حدث في قيد SQL |
| audit | صف في `audit_logs` |
| lab | صفحة ومسار ينشئان حدثاً مخزناً مثل بقية الأحداث |

## 12 الأسئلة الشائعة

| السؤال | الجواب |
| --- | --- |
| أين كلمة مرور المدير؟ | تُطبع من `run.py` وتُزرع في سكربت الإنشاء. لا تُنسخ هنا |
| هل SQLAlchemy مستخدم؟ | `requirements.txt` يدرجه. `app.py` يتصل بـ `sqlite3` مباشرة |
| هل التعليقات على الأحداث تعمل من الواجهة؟ | الجدول موجود. مسار API للتعليقات غير موجود في `app.py` |
| ما المنفذ؟ | 5000 على المضيف `0.0.0.0` مع `debug=True` |

## 13 البنية المعمارية

```
المتصفح
   |
   v
Flask app.py :5000
   |  جلسة + CSRFProtect + CORS محدود
   v
sqlite3  ->  socify.db
              users
              security_events
              event_comments
              rules
              audit_logs
              event_sources
```

## 14 التقنيات

| الحزمة في `requirements.txt` | الإصدار |
| --- | --- |
| Flask | 2.3.3 |
| Flask-CORS | 4.0.0 |
| Flask-WTF | 1.1.1 |
| WTForms | 3.0.1 |
| bcrypt | 4.0.1 |
| python-dotenv | 1.0.0 |
| Werkzeug | 2.3.7 |
| SQLAlchemy | 2.0.21 |
| Flask-SQLAlchemy | 3.0.5 |

`app.py` يستورد Flask وCORS وCSRFProtect وWerkzeug `generate_password_hash` و`check_password_hash` وbcrypt وsqlite3. دوال Werkzeug للتجزئة مستوردة. التحقق من الدخول يستخدم `bcrypt.checkpw`. استيراد SQLAlchemy داخل `app.py`: غير موجود. استدعاء `python-dotenv` داخل `app.py`: غير موجود.

## 15 شجرة الملفات

```
SOCify/
├── app.py
├── run.py
├── create_db.py
├── init_db.py
├── schema.sql
├── add_sample_data.py
├── quick_data.py
├── quick_fix_data.py
├── requirements.txt
├── socify.db
├── README.md
├── static/css/   auth, dashboard, lab, normalize, profile, rules, style
├── static/js/    auth, dashboard, lab, main, profile, rules
└── templates/    index, login, register, dashboard, lab, rules, profile, test
```

## 16 الواجهة الأمامية

قوالب Jinja منفصلة لكل شاشة، مع CSS وJS لكل منطقة (لوحة، مختبر، قواعد، ملف، دخول). مرشح القالب `getRoleName` يترجم الدور إلى العربية. لا إطار React أو Vue في الملفات الحالية.

## 17 الخادم الخلفي

تطبيق Flask واحد. الاتصال يُفتح ويُغلق داخل كل مسار. التسجيل يفرض الدور `analyst`. الدخول يشترط `is_active = 1`.

دالة `create_rule` بعد `log_audit` لا تحتوي `return` في نهاية الدالة داخل `app.py`. بقية مسارات الإنشاء ترجع JSON.

## 18 تدفق الطلب

```
POST /login
  -> قراءة البريد وكلمة المرور من JSON أو النموذج
  -> SELECT المستخدم النشط
  -> bcrypt.checkpw
  -> جلسة + last_login + audit
  -> JSON أو إعادة توجيه إلى /dashboard

POST /api/events
  -> login_required
  -> التحقق من الحقول الخمسة
  -> INSERT
  -> audit
  -> JSON فيه event_id وid
```

## 19 قاعدة البيانات

ملف `socify.db` في جذر المشروع. المخطط المرجعي `schema.sql` و`create_db.py`. الجداول الستة مذكورة في القسم 7.

عمود `event_sources.api_key` يخزّن النص الذي يرسله العميل عند الإنشاء. لا تُعرض قيم هذا العمود في هذا الدليل.

## 20 نقاط النهاية

| الطريقة | المسار | حماية |
| --- | --- | --- |
| GET | `/` | لا |
| GET | `/test` | لا |
| GET, POST | `/login` | لا |
| GET, POST | `/register` | لا |
| GET | `/logout` | يمسح الجلسة إن وُجد مستخدم |
| GET | `/dashboard` | دخول |
| GET | `/lab` | دخول |
| GET | `/rules` | دخول |
| GET | `/profile` | دخول |
| GET, POST | `/api/events` | دخول |
| PUT, DELETE | `/api/events/<id>` | دخول |
| GET | `/api/audit` | دخول |
| GET | `/api/rules` | دخول |
| POST | `/api/rules` | مدير SOC أو مدير |
| PUT | `/api/rules/<id>` | مدير SOC أو مدير |
| GET | `/api/sources` | دخول |
| POST | `/api/sources` | مدير SOC أو مدير |
| PUT | `/api/sources/<id>` | مدير SOC أو مدير |
| GET | `/api/stats` | دخول |
| POST | `/api/lab/event` | دخول |

مسارات مثل `/api/system-info` ظهرت في نسخة README السابقة. غير موجود في `app.py` الحالي.

## 21 المصادقة

جلسة Flask بعد نجاح `bcrypt.checkpw`. مفتاح الجلسة سلسلة ثابتة في `app.config['SECRET_KEY']` داخل `app.py`. لا تُنسخ هنا. التعليق البرمجي يطلب تغييرها في الإنتاج.

التسجيل يطلب بريداً وكلمة مرور واسماً. الفريق اختياري ويصبح سلسلة فارغة عند الغياب.

## 22 الأمان

السلوك الدفاعي الموجود:

- كلمات المرور تُخزَّن بعد `bcrypt.hashpw` و`gensalt`.
- الدخول يرفض الحساب عندما `is_active` ليس 1.
- `CSRFProtect` مفعّل على التطبيق.
- مسارات التعديل الحساسة للأدوار تستخدم `role_required`.
- استعلامات المستخدمين والأحداث تستخدم معاملات `?`.
- سجل تدقيق يحفظ عنوان IP ووكيل المتصفح.
- CORS محدود بعنوانين محليين.

ملاحظات من الكود الحالي:

- `debug=True` والمضيف `0.0.0.0`.
- مفتاح الجلسة مكتوب داخل المصدر.
- `GET /api/sources` يعيد صفوف المصادر كما هي من `SELECT *`، فيشمل عمود `api_key` إن وُجدت قيمة.
- تحديث القواعد والمصادر يبني جملة UPDATE من أسماء حقول ثابتة في قائمة داخل الدالة، والقيم تذهب كمعاملات.
- لا حد لمحاولات الدخول في الملفات الحالية.
- لا ملف `.env` يُحمَّل في `app.py` رغم وجود `python-dotenv` في المتطلبات.

## 23 الإعدادات

| المفتاح | المكان |
| --- | --- |
| `SECRET_KEY` | سلسلة في `app.py` |
| `DATABASE` | القيمة `socify.db` |
| المنفذ والمضيف | `0.0.0.0:5000` |
| أصول CORS | عنوانان على المنفذ 5000 |

## 24 التكاملات الخارجية

غير موجود في الملفات الحالية كاستدعاءات صادرة. عناوين المصادر في البذور نصوص مخزنة.

## 25 المهام والجدولة

غير موجود في الملفات الحالية. لا APScheduler ولا حلقة خلفية.

## 26 الملفات المهمة

`socify.db` بيانات التشغيل. `schema.sql` مرجع المخطط. تشغيل `create_db.py` يحذف ملف القاعدة الحالي ثم يعيد بناءه.

## 27 السجلات

`logging.basicConfig(level=logging.INFO)` ومنسّق باسم `logger`. مسارات التدقيق تكتب في جدول `audit_logs` وتعرض عبر `GET /api/audit` (افتراضي 100 سجل). ملف log على القرص: غير موجود في الملفات الحالية.

## 28 التثبيت

```
cd D:\VSCode\Projects\SOCify
pip install -r requirements.txt
python run.py
```

البديل: `python app.py`. العنوان المطبوع في `run.py`: `http://localhost:5000`.

## 29 دليل التطوير

- أضف مساراً في `app.py` ثم قالبًا في `templates` إن كان صفحة.
- أي جدول جديد يحتاج تعديلاً في `schema.sql` و`create_db.py` معاً لأن الإنشاء الأول يمر عبر `create_db`.
- `role_required` يتوقع قائمة أدوار لأن الفحص يستخدم `not in`.
- بعد إنشاء قاعدة، إعادة استدعاء `create_database` تمسح الملف.

## 30 النشر

Procfile أو Docker أو منصة سحابية: غير موجود في الملفات الحالية. التشغيل في الكود محلي مع وضع التصحيح.

## 31 النسخ الاحتياطي

انسخ `socify.db` وهو مغلق. لا سكربت نسخ في الملفات الحالية. احذر تشغيل `create_db.py` على نسخة تريد الإبقاء عليها لأنه يحذف الملف.

## 32 استكشاف الأخطاء

| العرض | المصدر |
| --- | --- |
| رفض CSRF على النماذج أو POST | `CSRFProtect(app)` مفعّل |
| Insufficient permissions | الدور ليس ضمن قائمة `role_required` |
| Invalid credentials | bcrypt لا يطابق أو الحساب غير نشط أو غير موجود |
| فشل إنشاء القاعدة | رسالة «خطأ في إنشاء قاعدة البيانات» ثم محاولة قراءة `schema.sql` |
| المنفذ مشغول | المنفذ ثابت 5000 |

## 33 الاعتماديات

القائمة الكاملة في القسم 14. التشغيل الفعلي يعتمد Flask وFlask-CORS وFlask-WTF وbcrypt وsqlite3.

## 34 القيود

- محاكاة تخزين وعرض، بلا جمع سجلات من أجهزة حقيقية في `app.py`.
- جدول التعليقات بلا واجهة مسار.
- دالة إنشاء القاعدة في مسار POST للقواعد بلا `return` ظاهر في نهاية الدالة.
- حزم SQLAlchemy في المتطلبات بلا استخدام في `app.py`.
- وضع التصحيح ومفتاح جلسة ثابت.

## 35 الحالة الحالية

الجذر يحتوي التطبيق والقوالب والملفات الثابتة و`socify.db` وسكربتات البذر. الواجهة عربية للأدوار عبر مرشح القالب، ونصوص فلاش الدخول بالإنجليزية كما هي في `app.py`.

## 36 القرارات

| القرار | الأثر |
| --- | --- |
| sqlite3 المباشر | المخطط في SQL خام |
| bcrypt للدخول | التجزئة عند التسجيل والتحقق عند الدخول |
| ثلاثة أدوار بقيد CHECK | أي دور آخر يرفضه SQLite عند الإدراج |
| CSRF على التطبيق كله | طلبات POST تحتاج رمز CSRF الخاص بـ Flask-WTF |

تناقضات:

- `requirements.txt` يدرج SQLAlchemy وFlask-SQLAlchemy وpython-dotenv. `app.py` لا يستوردها.
- README السابق وثّق مسارات مثل `/api/system-info` و`/api/db-stats`. هذه الدوال غير موجودة في `app.py` الحالي.
- `schema.sql` و`create_db.py` كلاهما يعرّف الجداول. مسار التشغيل العادي يستدعي `create_db` أولاً.

## 37 الاختبار

صفحة `GET /test` تعرض `test.html`. إطار pytest: غير موجود في الملفات الحالية.

## 38 متطلبات التشغيل

بايثون مع pip لتثبيت إصدارات `requirements.txt`. إصدار المفسر غير مثبت داخل مستودع SOCify. متصفح. المنفذ 5000 متاح.

## 39 سجل التغييرات

غير موجود في الملفات الحالية. لا رقم إصدار في ملفات المشروع.

## System Overview

محاكاة SOC محلية: متصفح، Flask، جلسة، وSQLite فيها مستخدمون وأحداث وقواعد ومصادر وتدقيق.

## Quick Reference

| البند | القيمة |
| --- | --- |
| التشغيل | `python run.py` |
| العنوان | `http://localhost:5000` |
| القاعدة | `socify.db` |
| أدوار | analyst وsoc_manager وadmin |

## Quick Start

```
cd D:\VSCode\Projects\SOCify
pip install -r requirements.txt
python run.py
```

اقرأ سطر بيانات الدخول الذي تطبعه `run.py` في الطرفية. سجّل الدخول ثم افتح اللوحة.

## For Non-Technical Users

النظام دفتر لأحداث أمنية تجريبية. المحلل يرى الأحداث ويحدّث حالتها. المدير يضيف قواعد ومصادر. المختبر يسجّل حدثاً تجريبياً داخل نفس الدفتر. السجل يحفظ من غيّر ماذا ومتى.

## For Developers

ابدأ من `login_required` و`role_required` و`log_audit`. عند إضافة جدول، حدّث `create_db.py` و`schema.sql`. تذكر أن `create_database` يمسح ملف القاعدة. أكمل `return` في أي مسار جديد حتى لا يسقط الطلب بلا استجابة.
